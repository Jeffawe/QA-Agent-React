import React, { useState, useRef } from 'react';
import type { PageDetails } from '../types';
import BetaWarning from './BetaWarning';

interface WebSocketData { message?: string; timestamp: number; page?: PageDetails; }

interface InitialData {
  pages: PageDetails[];
  messages: string[];
  timestamp: number;
}

const message = `QA Agent is currently in beta. Please note:

- Some features may not work as expected
- I am going to add more features like pausing and resuming the agent
- The goal field is not yet configurable
- Analysis results may vary in accuracy (I'm still working heavily on better analysis per page)
- I appreciate your feedback as I improve the tool`;

const UpdatesPage: React.FC = () => {
  const [port, setPort] = useState('3001');
  const [websocketport, setwebsocketPort] = useState('3002');
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<PageDetails[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  //Loading
  const [startServerloading, setstartServerLoading] = useState(false);
  const [stopServerloading, setStopServerLoading] = useState(false);
  const [connectedLoading, setConnectedLoading] = useState(false);


  const connect = () => {
    try {
      setConnectedLoading(true);
      const ws = new WebSocket(`ws://localhost:${websocketport}`);

      ws.onopen = () => {
        setConnected(true);
        setConnectedLoading(false); // Move here
      };

      ws.onerror = (error) => {
        setConnected(false);
        setConnectedLoading(false); // Move here
        alert('WebSocket connection error. Please check if the port is valid.');
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setConnected(false);
        setConnectedLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Route different event types to handlers
          switch (message.type) {
            case 'CONNECTION':
              alert(`🔗 Connection confirmed: ${message.data.message}`);
              break;

            case 'INITIAL_DATA':
              handleNewCrawlMapUpdate(message.data);
              handleMultipleNewLogs(message.data);
              break;

            case 'LOG':
              handleNewLog(message.data);
              break;

            case 'CRAWL_MAP_UPDATE':
              handleCrawlMapUpdate(message.data);
              break;

            default:
              console.log('Unknown event type:', message.type);
          }

        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current = ws;
    } catch (error) {
      setConnected(false);
      setConnectedLoading(false);
      alert('WebSocket connection error. Please check if the port is valid.');
      console.error('WebSocket connection error:', error);
    }
  };

  const disconnect = () => {
    try {
      setStopServerLoading(true);
      fetch(`http://localhost:${port}/stop/1`);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      setLogs([]);
      setUpdates([]);
    }
    catch (error) {
      alert('Problem when stopping the Server. Please check if the port (for server and websocket) are valid.');
      console.error('Error Stopping:', error);
    } finally {
      setStopServerLoading(false);
    }
  }

  const handleStartServer = async () => {
    // Ensure loading state is always reset
    setstartServerLoading(true);

    let timeoutId;

    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`http://localhost:${port}/start/1`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear the timeout if request succeeds
      clearTimeout(timeoutId);
      timeoutId = null;

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

    } catch (error: unknown) {
      // Clear timeout if it's still running
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'AbortError') {
        alert('Request timed out. The server may be down or not responding.');
        console.error('Request timed out after 10 seconds');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Failed to connect to server. Please check if the server is running and the port is correct.');
        console.error('Network error:', error);
      } else {
        alert('Failed to start agent. Please try again.');
        console.error('Failed to start agent:', error);
      }
    } finally {
      // Ensure loading is always set to false
      setstartServerLoading(false);
    }
  };

  // Fixed Event handlers
  const handleNewLog = (data: WebSocketData) => {
    if (!data.message) return;
    setLogs(prev => [...prev.slice(-49), data.message!]);
  };

  const handleMultipleNewLogs = (data: InitialData) => {
    if (!data.messages) return;
    setLogs(data.messages);
  }

  const handleNewCrawlMapUpdate = (data: InitialData) => {
    if (!data.pages) return;
    setUpdates(data.pages);
  };

  const handleCrawlMapUpdate = (data: WebSocketData) => {
    if (!data.page) return;

    setUpdates(prev => {
      const existingIndex = prev.findIndex(update => update.url === data.page?.url);

      if (existingIndex !== -1) {
        // Page exists - merge existing data with new data
        const newUpdates = [...prev];
        newUpdates[existingIndex] = {
          ...newUpdates[existingIndex], // Keep existing data
          ...data.page! // Override/add new data
        };
        return newUpdates;
      } else {
        // New page - add it (keeping only last 20 items)
        return [...prev.slice(-19), data.page!];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">Live Updates</h2>

        <BetaWarning message={message} />

        {/* Explanation Box */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-Time Agent Monitoring</h3>
                {showExplanation && (
                  <>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Monitor your QA Agent in real-time as it crawls and analyzes your website. This interface provides live updates and detailed analysis data.
                    </p>

                    {/* Server Start Section */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Start Localhost Server
                      </h4>
                      <p className="text-sm text-purple-800 mb-3">If your QA Agent isn't running yet, start it here:</p>
                      <div className="flex items-center space-x-3">
                        <input
                          placeholder="Server port (e.g. 8080)"
                          className="flex-1 p-2 text-sm border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                        />
                        <button
                          onClick={handleStartServer}
                          disabled={!port || startServerloading}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200">
                          {startServerloading ? "Starting..." : "Start Server"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">How to Monitor:</h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. <strong>WebSocket Port:</strong> Enter the port for live monitoring (typically different from server port)</li>
                        <li>2. Press "Connect" to establish WebSocket connection for real-time updates</li>
                        <li>3. View live logs and analysis data as the agent crawls pages</li>
                        <li>4. Monitor bugs, UI issues, and detailed page analysis in real-time</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex-shrink-0 ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label={showExplanation ? "Hide explanation" : "Show explanation"}
            >
              <svg className={`w-5 h-5 text-gray-500 hover:text-gray-700 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Connection Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Connection Settings</h3>
          <div className={`px-4 py-2 mb-5 rounded-full text-white text-center font-semibold ${connected ? 'bg-green-500' :
            'bg-gray-500'
            }`}>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent Port</label>
              <input
                placeholder="Port (default 3001)"
                value={websocketport}
                onChange={e => setwebsocketPort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex-shrink-0 pt-7">
              <button
                onClick={connect}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${connected
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                disabled={connected || connectedLoading}
              >
                {connected ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Connected</span>
                  </span>
                ) : (
                  connectedLoading ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Connecting...</span>
                    </span>
                  ) : (
                    <span>Connect</span>
                  )
                )}
              </button>
              <button
                onClick={disconnect}
                className={`px-6 py-3 ml-2 rounded-lg font-medium transition-all duration-200 
                  ${connected
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                disabled={!connected || stopServerloading}
              >
                {stopServerloading ? 'Stopping Server...' : "Stop Server and Disconnect"}
              </button>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Agent Logs</h3>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
            >
              {showLogs ? 'Hide' : 'Show'} Logs
            </button>
          </div>
          {showLogs && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto border-2 border-gray-700">
              <div className="text-xs font-mono">
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic">No logs yet. Connect to the agent to see live updates...</div>
                ) : (
                  logs.map((line, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Updates Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Live Page Analysis</h3>
          {updates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No page analysis data yet. Connect to the agent to see live updates as pages are analyzed.</p>
            </div>
          ) : (
            updates.map((page, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{page.title}</h4>
                    <p className="text-sm text-blue-600 underline break-all">{page.url}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Analyzed
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{page.description}</p>

                {page.analysis && (
                  <div className="space-y-4">
                    {/* Bugs Section */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Bugs Found ({page.analysis.bugs.length})
                      </h5>
                      {page.analysis.bugs.length === 0 ? (
                        <p className="text-sm text-red-700">No bugs detected</p>
                      ) : (
                        <ul className="space-y-2">
                          {page.analysis.bugs.map((bug, i) => (
                            <li key={i} className="text-sm">
                              <span className="text-red-800">{bug.description}</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${bug.severity === 'high' ? 'bg-red-600 text-white' :
                                bug.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                                }`}>
                                {bug.severity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* UI Issues Section */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        UI Issues ({page.analysis.ui_issues.length})
                      </h5>
                      {page.analysis.ui_issues.length === 0 ? (
                        <p className="text-sm text-yellow-700">No UI issues detected</p>
                      ) : (
                        <ul className="space-y-2">
                          {page.analysis.ui_issues.map((issue, i) => (
                            <li key={i} className="text-sm">
                              <span className="text-yellow-800">{issue.description}</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${issue.severity === 'high' ? 'bg-red-600 text-white' :
                                issue.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                                }`}>
                                {issue.severity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Notes Section */}
                    {page.analysis.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Analysis Notes
                        </h5>
                        <p className="text-sm text-blue-800 italic">{page.analysis.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdatesPage;