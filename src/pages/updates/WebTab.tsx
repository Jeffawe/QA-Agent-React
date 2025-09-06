import type { TabProps } from "../../types";
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;
const testKey = import.meta.env.VITE_TEST_KEY;

const WebTab: React.FC<TabProps> = ({ logs, connect, disconnect, updates, connected }) => {
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [websocketUrl, setWebsocketUrl] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [goal, setGoal] = useState('');
    const [showLogs, setShowLogs] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [, setIsLoading] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'>('disconnected');

    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000; // 3 seconds

    const stopAnalysis = useCallback(async () => {
        try {
            setStopping(true);
            setConnectionStatus('disconnected');
            try {
                await axios.get(`${baseUrl}/stop/${sessionId}`, {
                    timeout: 100000,
                });
            } catch (error) {
                console.error('Error stopping analysis:', error);
            }
            disconnect();
            setIsAnalyzing(false);
            setReconnectAttempts(0);
            setIsReconnecting(false);
        } catch (error) {
            console.error('Error stopping analysis:', error);
        } finally {
            setStopping(false);
        }
    }, [disconnect, sessionId]);

    const checkSessionStatus = useCallback(async (sessionId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${baseUrl}/status/${sessionId}`, { timeout: 5000 });
            return response.data.active === true;
        } catch (error) {
            console.error('Error checking session status:', error);
            return false;
        }
    }, []);

    const attemptReconnection = useCallback(async () => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log('Max reconnection attempts reached. Stopping analysis.');
            await stopAnalysis();
            return;
        }

        setIsReconnecting(true);
        setConnectionStatus('reconnecting');
        setReconnectAttempts(prev => prev + 1);

        console.log(`🔄 Reconnection attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);

        try {
            // First, check if the session is still active
            const isSessionActive = await checkSessionStatus(sessionId);
            
            if (!isSessionActive) {
                console.log('Session is no longer active. Stopping analysis.');
                await stopAnalysis();
                return;
            }

            // Try to get fresh WebSocket port
            const response = await axios.get(`${baseUrl}/websocket-port/${sessionId}`, { timeout: 10000 });
            
            if (response.data && response.data.websocketPort) {
                const url = new URL(baseUrl);
                const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                const newWebsocketUrl = `${wsProtocol}//${url.hostname}:${response.data.websocketPort}`;
                
                setWebsocketUrl(newWebsocketUrl);
                setConnectionStatus('connecting');
                
                // Attempt to connect
                connect(newWebsocketUrl);
                
                // Reset reconnect attempts on successful connection setup
                setTimeout(() => {
                    if (connected) {
                        setReconnectAttempts(0);
                        setIsReconnecting(false);
                        setConnectionStatus('connected');
                    }
                }, 2000);
            } else {
                throw new Error('No WebSocket port received');
            }
        } catch (error) {
            console.error(`Reconnection attempt ${reconnectAttempts + 1} failed:`, error);
            
            // Schedule next reconnection attempt
            setTimeout(() => {
                attemptReconnection();
            }, RECONNECT_DELAY);
        }
    }, [reconnectAttempts, sessionId, connect, connected, stopAnalysis, checkSessionStatus]);

    useEffect(() => {
        if (websocketUrl && isAnalyzing && !isReconnecting) {
            console.log('🔌 Establishing WebSocket connection...');
            setConnectionStatus('connecting');
            connect(websocketUrl);

            // Set up connection timeout
            const connectionTimeout = setTimeout(() => {
                if (!connected && isAnalyzing) {
                    console.log('WebSocket connection timeout. Attempting reconnection...');
                    setConnectionStatus('error');
                    attemptReconnection();
                }
            }, 10000); // 10 second timeout

            // Cleanup function
            return () => {
                clearTimeout(connectionTimeout);
                if (!isReconnecting) {
                    console.log('🔌 Cleaning up WebSocket connection...');
                }
            };
        }
    }, [websocketUrl, isAnalyzing, connect, connected, isReconnecting, attemptReconnection]);

    // Monitor connection status
    useEffect(() => {
        if (connected && isAnalyzing) {
            setConnectionStatus('connected');
            setReconnectAttempts(0);
            setIsReconnecting(false);
        } else if (isAnalyzing && !connected && !isReconnecting && websocketUrl) {
            // Connection lost during analysis
            console.log('Connection lost. Attempting reconnection...');
            setConnectionStatus('error');
            attemptReconnection();
        }
    }, [connected, isAnalyzing, isReconnecting, websocketUrl, attemptReconnection]);

    const startWebAnalysis = async () => {
        try {
            console.log("🚀 Starting web analysis...");

            setIsLoading(true);
            setConnectionStatus('connecting');
            
            if (!websiteUrl.trim()) {
                alert('Please enter a website URL');
                return;
            }
            if (!apiKey.trim()) {
                alert('Please enter your API key');
                return;
            }
            
            setIsAnalyzing(true);
            setReconnectAttempts(0);

            let sessionId = '';

            if (apiKey.startsWith('TEST')) {
                sessionId = "test_" + apiKey;
            } else {
                const data = await getId();
                sessionId = data.sessionId;
            }

            setSessionId(sessionId);

            const response2 = await axios.post(`${baseUrl}/setup-key/${sessionId}`, {
                apiKey: apiKey,
                testKey: testKey
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response2 || !response2.data || !response2.data.success) {
                throw new Error('API key setup failed');
            }

            let endPoint = `start/${sessionId}`;

            if (apiKey.startsWith('TEST')) {
                endPoint = `test/${apiKey}`;
            }

            // Clear the API key from memory immediately
            setApiKey('');

            // Increase timeout for initial connection
            const response = await axios.post(`${baseUrl}/${endPoint}`, {
                goal: goal,
                url: websiteUrl
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 60000 // 60 seconds for initial setup
            });

            if (response && response.data) {
                // Get the fresh websocket port from response
                const freshWebsocketPort = response.data.websocketport;
                const freshSessionId = response.data.sessionId;
                console.log("🔍 websocketport exists?", 'websocketport' in response.data);

                if (!freshWebsocketPort) {
                    console.error("❌ No websocketport in response!");
                    
                    // If no websocket port, try to get it via status endpoint
                    console.log("🔄 Trying to get websocket port from status endpoint...");
                    try {
                        const statusResponse = await axios.get(`${baseUrl}/websocket-port/${freshSessionId}`, { timeout: 30000 });
                        if (statusResponse.data && statusResponse.data.websocketPort) {
                            const url = new URL(baseUrl);
                            const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                            const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}:${statusResponse.data.websocketPort}`;
                            setWebsocketUrl(cleanBaseUrlWithPort);
                        } else {
                            throw new Error('No WebSocket port available');
                        }
                    } catch (statusError) {
                        console.error("❌ Failed to get websocket port from status:", statusError);
                        alert("❌ Failed to establish connection. The session may still be initializing. Please try reconnecting in a moment.");
                        setConnectionStatus('error');
                        return;
                    }
                } else {
                    setSessionId(freshSessionId);

                    const url = new URL(baseUrl);
                    // Map HTTP/HTTPS to WS/WSS
                    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                    const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}:${freshWebsocketPort}`;

                    setWebsocketUrl(cleanBaseUrlWithPort);
                }

                // Give a small delay to see if connect() runs
                setTimeout(() => {
                    console.log('✅ connect() call completed (after 1s delay)');
                }, 1000);

            } else {
                console.error("❌ Invalid response structure:", response);
                alert("❌ Invalid response from server");
                return;
            }

            setIsLoading(false);

        } catch (error: unknown) {
            const err = error as { response?: { data?: string }; message?: string };
            const errorMessage: string = err.response?.data || err.message || String(error);
            console.error('❌ Error starting session:', errorMessage);
            
            if (errorMessage.includes('timeout')) {
                alert(`⏱️ Initial connection timed out. The session may still be initializing in the background. You can try to reconnect in a moment.`);
                setConnectionStatus('error');
                // Don't stop analysis here - let user decide to reconnect or stop
            } else {
                alert(`❌ Error starting session: ${errorMessage}`);
                stopAnalysis();
            }
            setIsLoading(false);
        }
    };

    const getId = async () => {
        try {
            const response = await axios.get(`${baseUrl}/start`);
            return response.data;
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null) {
                const err = error as { response?: { data?: unknown }, message?: string };
                console.error('❌ Error getting start data:', err.response?.data || err.message);
            } else {
                console.error('❌ Error getting start data:', String(error));
            }
            throw error;
        }
    }

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'reconnecting': return 'bg-blue-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected to Web Service';
            case 'connecting': return 'Connecting...';
            case 'reconnecting': return `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
            case 'error': return 'Connection Error - Click Reconnect';
            default: return 'Disconnected';
        }
    };

    return (
        <div className="space-y-6">
            {/* Explanation Box */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Web-Based Analysis</h3>
                        {isExpanded && (
                            <div>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Analyze any website using our cloud-based QA Agent. No local installation required - just provide a URL and your API key.
                                </p>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-900 mb-2">How it works:</h4>
                                    <ol className="text-sm text-purple-800 space-y-1">
                                        <li>1. Enter the website URL you want to analyze</li>
                                        <li>2. Provide your API key for authentication</li>
                                        <li>3. Click "Start Analysis" to begin the process</li>
                                        <li>4. Monitor real-time progress and results</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-yellow-200 transition-colors duration-200"
                        aria-label={isExpanded ? "Hide beta warning" : "Show beta warning"}
                    >
                        <svg className={`w-5 h-5 text-yellow-600 hover:text-yellow-800 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Analysis Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Website Analysis</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={websiteUrl}
                            onChange={e => setWebsiteUrl(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            disabled={isAnalyzing}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key (For Testing this is the unique key given to you)</label>
                        <input
                            type="password"
                            placeholder="Enter your API key"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            disabled={isAnalyzing}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Goal of the Agent</label>
                        <input
                            type="string"
                            placeholder="Enter your Goal"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            disabled={isAnalyzing}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                            onClick={startWebAnalysis}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isAnalyzing
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Analyzing...</span>
                                </span>
                            ) : (
                                'Start Analysis'
                            )}
                        </button>

                        {connectionStatus === 'error' && isAnalyzing && (
                            <button
                                onClick={attemptReconnection}
                                disabled={isReconnecting}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                            >
                                {isReconnecting ? 'Reconnecting...' : 'Try Reconnect'}
                            </button>
                        )}

                        {(connected || isAnalyzing) && (
                            <button
                                onClick={stopAnalysis}
                                disabled={stopping}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                            >
                                {stopping ? 'Stopping...' : 'Stop Analysis'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status */}
            {(connected || isAnalyzing) && (
                <div className={`px-4 py-2 rounded-full text-white text-center font-semibold ${getConnectionStatusColor()}`}>
                    {getConnectionStatusText()}
                </div>
            )}

            {/* Logs Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Agent Logs</h3>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                    >
                        {showLogs ? 'Hide' : 'Show'} Logs
                    </button>
                </div>
                {showLogs && (
                    <div className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg h-48 overflow-y-auto border-2 border-gray-700">
                        <div className="text-xs font-mono">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 italic">No logs yet. Connect to the local agent to see live updates...</div>
                            ) : (
                                logs.map((line, idx) => (
                                    <div key={idx} className="mb-1 break-words">
                                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Updates Section */}
            <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Live Page Analysis</h3>
                {updates.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm sm:text-base">No page analysis data yet.</p>
                    </div>
                ) : (
                    updates.map((page, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
                                <div className="flex-1">
                                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{page.title}</h4>
                                    <p className="text-xs sm:text-sm text-blue-600 underline break-all">{page.url}</p>
                                </div>
                                <div className="flex-shrink-0 self-start">
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Analyzed
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4 text-sm sm:text-base">{page.description}</p>

                            {page.analysis && (
                                <div className="space-y-4">
                                    {/* Bugs Section */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                        <h5 className="font-semibold text-red-900 mb-2 flex items-center text-sm sm:text-base">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Bugs Found ({page.analysis.bugs.length})
                                        </h5>
                                        {page.analysis.bugs.length === 0 ? (
                                            <p className="text-xs sm:text-sm text-red-700">No bugs detected</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {page.analysis.bugs.map((bug, i) => (
                                                    <li key={i} className="text-xs sm:text-sm">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                                            <span className="text-red-800 break-words">{bug.description}</span>
                                                            <span className={`inline-block px-2 py-1 rounded text-xs self-start ${bug.severity === 'high' ? 'bg-red-600 text-white' :
                                                                bug.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                                                    'bg-green-600 text-white'
                                                                }`}>
                                                                {bug.severity}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* UI Issues Section */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                                        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center text-sm sm:text-base">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            UI Issues ({page.analysis.ui_issues.length})
                                        </h5>
                                        {page.analysis.ui_issues.length === 0 ? (
                                            <p className="text-xs sm:text-sm text-yellow-700">No UI issues detected</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {page.analysis.ui_issues.map((issue, i) => (
                                                    <li key={i} className="text-xs sm:text-sm">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                                            <span className="text-yellow-800 break-words">{issue.description}</span>
                                                            <span className={`inline-block px-2 py-1 rounded text-xs self-start ${issue.severity === 'high' ? 'bg-red-600 text-white' :
                                                                issue.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                                                    'bg-green-600 text-white'
                                                                }`}>
                                                                {issue.severity}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    {page.analysis.notes && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                            <h5 className="font-semibold text-blue-900 mb-2 flex items-center text-sm sm:text-base">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Analysis Notes
                                            </h5>
                                            <p className="text-xs sm:text-sm text-blue-800 italic break-words">{page.analysis.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WebTab;