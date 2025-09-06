import React, { useState, useEffect, useCallback } from 'react';

const baseUrl = import.meta.env.VITE_API_URL;
const admin_password = import.meta.env.VITE_PASSWORD;

interface HealthData {
    message: string;
    data: string;
}

interface SessionInfo {
    id: string;
}

const AdminHealthDashboard: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [stoppingAll, setStoppingAll] = useState(false);
    const [stoppingSessions, setStoppingSessions] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [authError, setAuthError] = useState('');

    const showMessage = useCallback((text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    }, []);

    const authenticate = async () => {
        if (!password.trim()) {
            setAuthError('Please enter a password');
            return;
        }

        if(!admin_password) {
            setAuthError('Admin password is not set');
            return;
        }

        setIsAuthLoading(true);
        setAuthError('');

        try {
            if(password === admin_password) {
                setIsAuthenticated(true);
                await fetchHealthData();
            } else {
                setAuthError('Invalid password. Please try again.');
            }
        } catch {
            setAuthError('Invalid password. Please try again.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const fetchHealthData = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${baseUrl}/health`, {});

            if (response.ok) {
                const responseData = await response.json();
                const { message, data } = responseData;
                setHealthData({ message, data });

                // Parse sessions from data string
                const match = data.match(/which are (.+)$/);
                if (match && match[1].trim() !== '') {
                    const sessionIds = match[1].split(', ').filter((id: string) => id.trim());
                    setSessions(sessionIds.map((id: string) => ({ id: id.trim() })));
                } else {
                    setSessions([]);
                }
            } else {
                throw new Error('Failed to fetch health data');
            }
        } catch (error) {
            console.error('Error fetching health data:', error);
            setHealthData({ message: 'Error connecting to server', data: 'Unable to fetch server data' });
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const stopSession = async (sessionId: string) => {
        if (!window.confirm(`Are you sure you want to stop session: ${sessionId}?`)) {
            return;
        }

        setStoppingSessions(prev => new Set([...prev, sessionId]));

        try {
            const response = await fetch(`${baseUrl}/stop/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${password}`
                }
            });

            if (response.ok) {
                showMessage(`Session ${sessionId} stopped successfully`, 'success');
                await fetchHealthData();
            } else {
                throw new Error('Failed to stop session');
            }
        } catch (error) {
            console.error('Error stopping session:', error);
            showMessage(`Failed to stop session ${sessionId}`, 'error');
        } finally {
            setStoppingSessions(prev => {
                const newSet = new Set(prev);
                newSet.delete(sessionId);
                return newSet;
            });
        }
    };

    const stopAllSessions = async () => {
        if (!window.confirm('Are you sure you want to stop ALL sessions? This action cannot be undone.')) {
            return;
        }

        setStoppingAll(true);

        try {
            const response = await fetch(`${baseUrl}/stop`, {
                headers: {
                    'Authorization': `Bearer ${password}`
                }
            });

            if (response.ok) {
                showMessage('All sessions stopped successfully', 'success');
                await fetchHealthData();
            } else {
                throw new Error('Failed to stop all sessions');
            }
        } catch (error) {
            console.error('Error stopping all sessions:', error);
            showMessage('Failed to stop all sessions', 'error');
        } finally {
            setStoppingAll(false);
        }
    };

    const handlePasswordKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            authenticate();
        }
    };

    // Auto-refresh effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (autoRefresh && isAuthenticated) {
            interval = setInterval(fetchHealthData, 10000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, isAuthenticated, fetchHealthData]);

    // Initial data fetch when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchHealthData();
        }
    }, [isAuthenticated, fetchHealthData]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">🔧 Admin Dashboard</h1>
                        <p className="text-purple-100">Server Management & Monitoring</p>
                    </div>
                    
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Enter Admin Password</h2>
                        
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Admin Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyPress={handlePasswordKeyPress}
                                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                            
                            {authError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {authError}
                                </div>
                            )}
                            
                            <button
                                onClick={authenticate}
                                disabled={isAuthLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                            >
                                {isAuthLoading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </span>
                                ) : (
                                    'Access Dashboard'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🔧 Admin Health Dashboard</h1>
                        <p className="text-gray-600">Server Management & Monitoring</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAuthenticated(false);
                            setPassword('');
                            setHealthData(null);
                            setSessions([]);
                        }}
                        className="mt-4 sm:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <button
                        onClick={fetchHealthData}
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Refreshing...</span>
                            </span>
                        ) : (
                            <>🔄 Refresh Data</>
                        )}
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="autoRefresh"
                            checked={autoRefresh}
                            onChange={e => {
                                setAutoRefresh(e.target.checked);
                                showMessage(
                                    e.target.checked ? 'Auto-refresh enabled (every 10 seconds)' : 'Auto-refresh disabled',
                                    'success'
                                );
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="autoRefresh" className="text-gray-700 font-medium text-sm sm:text-base">
                            Auto-refresh every 10 seconds
                        </label>
                    </div>
                </div>
            </div>

            {/* Health Information */}
            {healthData && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        📊 Server Health
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${healthData.message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span className="text-base sm:text-lg text-gray-700">{healthData.message}</span>
                        </div>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg font-mono text-xs sm:text-sm break-words">
                            {healthData.data}
                        </p>
                    </div>
                </div>
            )}

            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    🖥️ Active Sessions ({sessions.length})
                </h3>
                
                {sessions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm sm:text-base">No active sessions</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all duration-200">
                                <div className="font-mono text-xs sm:text-sm bg-white p-2 rounded border mb-3 break-all">
                                    {session.id}
                                </div>
                                <button
                                    onClick={() => stopSession(session.id)}
                                    disabled={stoppingSessions.has(session.id)}
                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {stoppingSessions.has(session.id) ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Stopping...</span>
                                        </span>
                                    ) : (
                                        <>🛑 Stop Session</>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-red-900 mb-2 flex items-center">
                    ⚠️ Danger Zone
                </h3>
                <p className="text-red-700 mb-4 text-sm sm:text-base">These actions will affect all running sessions</p>
                <button
                    onClick={stopAllSessions}
                    disabled={stoppingAll || sessions.length === 0}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                    {stoppingAll ? (
                        <span className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Stopping All...</span>
                        </span>
                    ) : (
                        <>🛑 Stop All Sessions ({sessions.length})</>
                    )}
                </button>
            </div>

            {/* Status Messages */}
            {message && (
                <div className={`p-4 rounded-lg text-sm sm:text-base ${message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default AdminHealthDashboard;