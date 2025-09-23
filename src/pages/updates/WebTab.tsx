import type { TabProps } from "../../types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PageAnalysisDisplay from "../PageAnalysisDisplay";

const baseUrl = import.meta.env.VITE_API_URL;
const testKey = import.meta.env.VITE_TEST_KEY;

interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

const WebTab: React.FC<TabProps> = ({
  logs,
  connect,
  disconnect,
  updates,
  connected,
  socketRef,
}) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [goal, setGoal] = useState("");
  const [showLogs, setShowLogs] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setIsLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error" | "reconnecting"
  >("disconnected");

  // New state variables
  const [detailed, setDetailed] = useState(false);
  const [additionalInfoExpanded, setAdditionalInfoExpanded] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    { key: "", value: "", id: crypto.randomUUID() },
  ]);

  const connectedRef = useRef(connected);

  const MAX_RECONNECT_ATTEMPTS = 3;
  const MAX_KEY_VALUE_PAIRS = 10;

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      // If backend sent structured JSON
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          return error.response.data;
        }
        if (typeof error.response.data === "object") {
          return JSON.stringify(error.response.data.message ?? error.response.data); // 👈 ensures it's a string
        }
      }
      return error.message;
    }
    return String(error);
  };

  // Key-Value pair management functions
  const addKeyValuePair = () => {
    if (keyValuePairs.length < MAX_KEY_VALUE_PAIRS) {
      setKeyValuePairs([
        ...keyValuePairs,
        { key: "", value: "", id: crypto.randomUUID() },
      ]);
    }
  };

  const removeKeyValuePair = (id: string) => {
    if (keyValuePairs.length > 1) {
      setKeyValuePairs(keyValuePairs.filter((pair) => pair.id !== id));
    }
  };

  const updateKeyValuePair = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
    setKeyValuePairs(
      keyValuePairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  const getAdditionalData = () => {
    const data: { [key: string]: string | boolean } = {};

    // Add the detailed flag to the data object
    data.detailed = detailed;

    // Add user-defined key-value pairs
    keyValuePairs.forEach((pair) => {
      if (pair.key.trim() && pair.value.trim()) {
        data[pair.key.trim()] = pair.value.trim();
      }
    });

    return data;
  };

  const stopAnalysis = useCallback(async () => {
    try {
      setStopping(true);
      setConnectionStatus("disconnected");
      try {
        await axios.get(`${baseUrl}/stop/${sessionId}`, {
          timeout: 100000,
        });
      } catch (error) {
        console.error("Error stopping analysis:", error);
      }
      disconnect();
      setIsAnalyzing(false);
      setReconnectAttempts(0);
      setIsReconnecting(false);
    } catch (error) {
      console.error("Error stopping analysis:", error);
    } finally {
      setStopping(false);
    }
  }, [disconnect, sessionId]);

  const checkSessionStatus = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        const response = await axios.get(`${baseUrl}/status/${sessionId}`, {
          timeout: 5000,
        });
        return response.data.active === true;
      } catch (error) {
        console.error("Error checking session status:", error);
        return false;
      }
    },
    []
  );

  const attemptReconnection = useCallback(async () => {
    if (isReconnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("Reconnection already in progress or max attempts reached");
      return;
    }

    setIsReconnecting(true);
    setConnectionStatus("reconnecting");

    const nextAttempts = reconnectAttempts + 1;
    setReconnectAttempts(nextAttempts);

    console.log(
      `🔄 Reconnection attempt ${nextAttempts}/${MAX_RECONNECT_ATTEMPTS}`
    );

    try {
      // First, check if the session is still active
      const isSessionActive = await checkSessionStatus(sessionId);

      if (!isSessionActive) {
        console.log("Session is no longer active. Stopping analysis.");
        setIsAnalyzing(false);
        await stopAnalysis();
        return;
      }

      // Close existing connection if any
      if (socketRef && socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      // Small delay before reconnection attempt
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const url = new URL(baseUrl);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}/websocket?sessionId=${sessionId}`;

      setConnectionStatus("connecting");
      connect(cleanBaseUrlWithPort);

      // Wait a bit to see if connection succeeds
      setTimeout(() => {
        if (connected) {
          console.log("Reconnection successful");
          setReconnectAttempts(0);
          setIsReconnecting(false);
          setConnectionStatus("connected");
        } else if (nextAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log("Max reconnection attempts reached. Stopping analysis.");
          stopAnalysis();
        } else {
          setIsReconnecting(false);
          setConnectionStatus("error");
        }
      }, 5000);
    } catch (error) {
      console.error(`Reconnection attempt ${nextAttempts} failed:`, error);
      setIsReconnecting(false);

      if (nextAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log("Max reconnection attempts reached. Stopping analysis.");
        await stopAnalysis();
      } else {
        setConnectionStatus("error");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionId,
    reconnectAttempts,
    isReconnecting,
    connected,
    checkSessionStatus,
    stopAnalysis,
    connect,
  ]);

  // Connect to WebSocket
  useEffect(() => {
    if (websocketUrl && isAnalyzing && !isReconnecting && !connected) {
      console.log("🔌 Establishing WebSocket connection...");
      setConnectionStatus("connecting");
      connect(websocketUrl);

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!connectedRef.current && isAnalyzing) {
          console.log("WebSocket connection timeout.");
          setConnectionStatus("error");
        } else if (connectedRef.current && isAnalyzing) {
          setConnectionStatus("connected");
          setReconnectAttempts(0);
        }
      }, 20000);

      // Cleanup function
      return () => {
        clearTimeout(connectionTimeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocketUrl, isAnalyzing, isReconnecting, connected]);

  useEffect(() => {
    connectedRef.current = connected;
    if (connected) {
      setConnectionStatus("connected");
    }
  }, [connected]);

  const startWebAnalysis = async () => {
    try {
      console.log("🚀 Starting web analysis...");

      setIsLoading(true);
      setConnectionStatus("connecting");

      if (!websiteUrl.trim()) {
        alert("Please enter a website URL");
        return;
      }
      if (!apiKey.trim()) {
        alert("Please enter your API key");
        return;
      }

      setIsAnalyzing(true);
      setReconnectAttempts(0);

      let sessionId = "";

      if (apiKey.startsWith("TEST")) {
        sessionId = "test_" + apiKey;
      } else {
        const data = await getId();
        sessionId = data.sessionId;
      }

      setSessionId(sessionId);

      const response2 = await axios.post(
        `${baseUrl}/setup-key/${sessionId}`,
        {
          apiKey: apiKey,
          testKey: testKey,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response2 || !response2.data || !response2.data.success) {
        throw new Error("API key setup failed");
      }

      let endPoint = `start/${sessionId}`;

      if (apiKey.startsWith("TEST")) {
        endPoint = `test/${apiKey}`;
      }

      // Clear the API key from memory immediately
      setApiKey("");

      // Prepare the request payload with additional data
      const requestPayload = {
        goal: goal,
        url: websiteUrl,
        data: getAdditionalData(),
      };

      console.log("📤 Sending request with payload:", requestPayload);

      // Increase timeout for initial connection
      const response = await axios.post(
        `${baseUrl}/${endPoint}`,
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 seconds for initial setup
        }
      );

      if (response && response.data) {
        // Get the fresh websocket port from response
        const freshSessionId = response.data.sessionId;
        console.log(
          "🔍 websocketport exists?",
          "websocketport" in response.data
        );
        setSessionId(freshSessionId);
        const url = new URL(baseUrl);
        const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
        const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}/websocket?sessionId=${freshSessionId}`;
        setWebsocketUrl(cleanBaseUrlWithPort);
      } else {
        console.error("❌ Invalid response structure:", response);
        alert("❌ Invalid response from server");
        return;
      }

      setIsLoading(false);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("❌ Error starting session:", errorMessage);

      if (errorMessage.includes("timeout")) {
        alert(
          `⏱️ Initial connection timed out. The session may still be initializing in the background. You can try to reconnect in a moment.`
        );
        setConnectionStatus("error");
        setIsAnalyzing(true);
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
      const errorMessage = getErrorMessage(error);
      console.error("❌ Error getting session ID:", errorMessage);
      throw error;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "reconnecting":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected to Web Service";
      case "connecting":
        return "Connecting...";
      case "reconnecting":
        return `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
      case "error":
        return "Connection Error - Click Reconnect";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="space-y-6">
      {/* Explanation Box */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Web-Based Analysis
            </h3>
            {isExpanded && (
              <div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Analyze any website using our cloud-based QA Agent. No local
                  installation required - just provide a URL and your API key.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    How it works:
                  </h4>
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
            <svg
              className={`w-5 h-5 text-yellow-600 hover:text-yellow-800 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
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

      {/* Analysis Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Website Analysis
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key (For Testing this is the unique key given to you)
            </label>
            <input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal of the Agent
            </label>
            <input
              type="string"
              placeholder="Enter your Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={isAnalyzing}
            />
          </div>

          {/* Detailed Analysis Switch */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailed}
                    onChange={(e) => setDetailed(e.target.checked)}
                    disabled={isAnalyzing}
                    className="sr-only"
                  />
                  <div
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${detailed ? "bg-blue-600" : "bg-gray-300"
                      } ${isAnalyzing
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                      }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${detailed ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Detailed Analysis
                  </span>
                </label>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Enable detailed analysis to get comprehensive results on every UI
              element per page.
              <span className="font-medium">
                {" "}
                Note: This will take significantly more time to complete.
              </span>
            </p>
          </div>

          {/* Additional Information Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setAdditionalInfoExpanded(!additionalInfoExpanded)}
              disabled={isAnalyzing}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <div>
                <h4 className="font-medium text-gray-800">
                  Additional Information
                </h4>
                <p className="text-sm text-gray-600">
                  Add custom key-value pairs for extra context (optional)
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${additionalInfoExpanded ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {additionalInfoExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Add up to {MAX_KEY_VALUE_PAIRS} custom key-value pairs
                    </p>
                    <button
                      onClick={addKeyValuePair}
                      disabled={
                        isAnalyzing ||
                        keyValuePairs.length >= MAX_KEY_VALUE_PAIRS
                      }
                      className={`text-sm px-3 py-1 rounded-md transition-colors duration-200 ${isAnalyzing ||
                          keyValuePairs.length >= MAX_KEY_VALUE_PAIRS
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                    >
                      Add Pair
                    </button>
                  </div>

                  {keyValuePairs.map((pair) => (
                    <div key={pair.id} className="flex space-x-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Key"
                          value={pair.key}
                          onChange={(e) =>
                            updateKeyValuePair(pair.id, "key", e.target.value)
                          }
                          disabled={isAnalyzing}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Value"
                          value={pair.value}
                          onChange={(e) =>
                            updateKeyValuePair(pair.id, "value", e.target.value)
                          }
                          disabled={isAnalyzing}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                      {keyValuePairs.length > 1 && (
                        <button
                          onClick={() => removeKeyValuePair(pair.id)}
                          disabled={isAnalyzing}
                          className={`p-2 rounded-md transition-colors duration-200 ${isAnalyzing
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50"
                            }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={startWebAnalysis}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isAnalyzing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </span>
              ) : (
                "Start Analysis"
              )}
            </button>

            {connectionStatus === "error" && isAnalyzing && (
              <button
                onClick={attemptReconnection}
                disabled={isReconnecting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                {isReconnecting ? "Reconnecting..." : "Try Reconnect"}
              </button>
            )}

            reconnectButton

            {(connected || isAnalyzing) && (
              <button
                onClick={stopAnalysis}
                disabled={stopping}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                {stopping ? "Stopping..." : "Stop Analysis"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      {(connected || isAnalyzing) && (
        <div
          className={`px-4 py-2 rounded-full text-white text-center font-semibold ${getConnectionStatusColor()}`}
        >
          {getConnectionStatusText()}
        </div>
      )}

      <PageAnalysisDisplay
        logs={logs}
        updates={updates}
        showLogs={showLogs}
        onToggleLogs={setShowLogs}
      />
    </div>
  );
};

export default WebTab;
