import React, { useState } from 'react';
import type { TabProps } from '../../types';


// Local Tab Component (your current implementation)
const LocalTab: React.FC<TabProps> = ({ logs, connect, disconnect, setwebsocketPort,
  port, updates, connected, connectedLoading, stopServerloading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  const connectToWebSocket = () => {
    const baseUrl = `http://localhost:${port}`;
    const url = new URL(baseUrl);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    // Include the port in the WebSocket URL
    const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}:${url.port}/websocket?sessionId=1`;
    connect(cleanBaseUrlWithPort);
  };

  return (
    <div className="space-y-6">
      {/* Explanation Box */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Local Agent Monitoring</h3>
            {isExpanded && (
              <div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Monitor your locally running QA Agent in real-time. This connects directly to your local instance via WebSocket.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Make sure you have the QA Agent running locally via npm package</li>
                    <li>2. Enter the port (typically 3001)</li>
                    <li>3. Press "Connect" to establish connection</li>
                    <li>4. Monitor real-time logs and analysis data</li>
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

      {/* Connection Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Local Connection Settings</h3>
        <div className={`px-4 py-2 mb-5 rounded-full text-white text-center font-semibold ${connected ? 'bg-green-500' : 'bg-gray-500'}`}>
          {connected ? 'Connected to Local Agent' : 'Disconnected'}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
            <input
              placeholder="Port (default 3001)"
              value={port}
              onChange={e => setwebsocketPort && setwebsocketPort(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={() => connectToWebSocket()}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${connected
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              disabled={connected || connectedLoading}
            >
              {connected ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Connected</span>
                </span>
              ) : (
                connectedLoading ? (
                  <span className="flex items-center justify-center space-x-2">
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
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap
                ${connected
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              disabled={!connected || stopServerloading}
            >
              {stopServerloading ? 'Stopping...' : "Stop Server"}
            </button>
          </div>
        </div>
      </div>

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
            <p className="text-gray-500 text-sm sm:text-base">No page analysis data yet. Connect to the local agent to see live updates as pages are analyzed.</p>
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

export default LocalTab;