import React, { useState } from "react";
import type { TabProps } from "../../types";
import PageAnalysisDisplay from "../PageAnalysisDisplay";

// Local Tab Component (your current implementation)
const LocalTab: React.FC<TabProps> = ({
  logs,
  connect,
  disconnect,
  setwebsocketPort,
  port,
  updates,
  connected,
  connectedLoading,
  stopServerloading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  const connectToWebSocket = () => {
    const baseUrl = `https://localhost:${port}`;
    const url = new URL(baseUrl);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
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
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Local Agent Monitoring
            </h3>
            {isExpanded && (
              <div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Monitor your locally running QA Agent in real-time. This
                  connects directly to your local instance via WebSocket.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Setup Instructions:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>
                      1. Make sure you have the QA Agent running locally via npm
                      package
                    </li>
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
            <svg
              className={`w-5 h-5 text-yellow-600 hover:text-yellow-800 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Connection Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Local Connection Settings
        </h3>
        <div
          className={`px-4 py-2 mb-5 rounded-full text-white text-center font-semibold ${
            connected ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {connected ? "Connected to Local Agent" : "Disconnected"}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              placeholder="Port (default 3001)"
              value={port}
              onChange={(e) =>
                setwebsocketPort && setwebsocketPort(e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={() => connectToWebSocket()}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                connected
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={connected || connectedLoading}
            >
              {connected ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Connected</span>
                </span>
              ) : connectedLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Connecting...</span>
                </span>
              ) : (
                <span>Connect</span>
              )}
            </button>
            <button
              onClick={disconnect}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap
                ${
                  connected
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              disabled={!connected || stopServerloading}
            >
              {stopServerloading ? "Stopping..." : "Stop Server"}
            </button>
          </div>
        </div>
      </div>

      <PageAnalysisDisplay
        logs={logs}
        updates={updates}
        showLogs={showLogs}
        onToggleLogs={setShowLogs}
      />
    </div>
  );
};

export default LocalTab;
