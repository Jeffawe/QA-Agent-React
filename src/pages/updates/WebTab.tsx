import type { TabProps } from "../../types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PageAnalysisDisplay from "../PageAnalysisDisplay";
import usageTracker, { addCrawlerConfig } from "./freeTrial";

const baseUrl = import.meta.env.VITE_API_URL;
const testKey = import.meta.env.VITE_TEST_KEY;

interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

interface ConfigFile {
  detailed?: boolean;
  endpoint?: boolean;
  goal: string;
  key: string;
  url: string;
  port?: number;
  data?: {
    [key: string]: unknown;
  };
}

const WebTab: React.FC<TabProps> = ({
  logs,
  connect,
  disconnect,
  updates,
  connected,
  socketRef
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
  const [endpointMode, setEndpointMode] = useState(false);
  const [crossPlatform, setCrossPlatform] = useState(false);
  const [optimizeImage, setOptimizeImage] = useState(false);
  const [additionalInfoExpanded, setAdditionalInfoExpanded] = useState(false);
  const [moreInfoExpanded, setMoreInfoExpanded] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    { key: "", value: "", id: crypto.randomUUID() },
  ]);

  const [configFileExpanded, setConfigFileExpanded] = useState(false);
  const [configFile, setConfigFile] = useState<ConfigFile | null>(null);
  const [configFileName, setConfigFileName] = useState<string>("");
  const [isStarting, setStarting] = useState(false);

  const connectedRef = useRef(connected);
  const startingRef = useRef(false);

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

  async function encryptApiKey(apiKey: string, publicKey: string) {
    try {
      // Convert the PEM public key to a format Web Crypto can use
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      const pemContents = publicKey
        .replace(pemHeader, "")
        .replace(pemFooter, "")
        .replace(/\s/g, "");

      // Convert base64 to ArrayBuffer
      const binaryDer = atob(pemContents);
      const binaryDerArray = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        binaryDerArray[i] = binaryDer.charCodeAt(i);
      }

      // Import the public key
      const cryptoKey = await crypto.subtle.importKey(
        "spki",
        binaryDerArray.buffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,
        ["encrypt"]
      );

      // Encrypt the API key
      const encoded = new TextEncoder().encode(apiKey);
      const encrypted = await crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        cryptoKey,
        encoded
      );

      // Convert to base64 for transmission
      const encryptedArray = new Uint8Array(encrypted);
      const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));

      return encryptedBase64;
    } catch (error) {
      throw new Error(`Failed to encrypt API key. Error: ${error}`);
    }
  }

  const handleConfigFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setConfigFile(json);
        setConfigFileName(file.name);

        // Populate fields from config file
        if (json.url) setWebsiteUrl(json.url);
        if (json.goal) setGoal(json.goal);
        if (json.key) setApiKey(json.key);
        if (typeof json.endpoint === 'boolean') setEndpointMode(json.endpoint);
        if (typeof json.detailed === 'boolean') setDetailed(json.detailed);

        alert("✅ Config file loaded successfully!");
      } catch (error) {
        alert("❌ Invalid JSON file. Please check the file format.");
        console.error("Error parsing config file:", error);
      }
    };
    reader.readAsText(file);
  };

  const clearConfigFile = () => {
    setConfigFile(null);
    setConfigFileName("");
  };

  const getAdditionalData = () => {
    const data: { [key: string]: unknown } = {};

    // Add the detailed flag to the data object
    data.detailed = detailed;
    data.optimizeImages = optimizeImage;
    data.crossPlatform = crossPlatform;

    if (configFile && configFile.data) {
      Object.entries(configFile.data).forEach(([key, value]) => {
        data[key] = value;
      });
    }

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
      setStarting(false);
      setConnectionStatus("disconnected");
      try {
        await axios.get(`${baseUrl}/stop/${sessionId}`, {
          timeout: 100000,
        });
      } catch (error) {
        alert(`Error stopping analysis: ${getErrorMessage(error)}`);
      }
      disconnect();
      setIsAnalyzing(false);
      setReconnectAttempts(0);
      setIsReconnecting(false);
      setSessionId("");
    } catch (error) {
      alert(`Error stopping analysis: ${getErrorMessage(error)}`);
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
      } catch (error: unknown) {
        alert(`Error checking session status: ${getErrorMessage(error)}`);
        return false;
      }
    },
    []
  );

  const attemptReconnection = useCallback(async () => {
    if (isReconnecting) {
      console.log("Reconnection already in progress or max attempts reached");
      return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("Max reconnection attempts reached");
      alert("Max reconnection attempts reached. Stopping analysis.");
      stopAnalysis();
      return;
    }

    if (!sessionId) {
      console.log("No session ID available for reconnection");
      alert("No session ID available. Cannot reconnect.");
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
        alert("Max reconnection attempts reached. Stopping analysis.");
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
    if (websocketUrl && websocketUrl !== "" && isAnalyzing && !isReconnecting && !connected) {
      console.log("🔌 Establishing WebSocket connection...");
      setConnectionStatus("connecting");
      connect(websocketUrl);
      setWebsocketUrl("");

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
    } else {
      setConnectionStatus("disconnected");
      setIsAnalyzing(false);
    }
  }, [connected]);

  const startWebAnalysis = async () => {
    try {
      console.log("🚀 Starting web analysis...");

      if (startingRef.current || isStarting) {
        return;
      }

      startingRef.current = true;
      setStarting(true)

      // Check if the API key is a free trial
      if (apiKey === "FREE-TRIAL") {
        const isFree = await usageTracker(websiteUrl, goal);

        if (!isFree.success) {
          alert(isFree.error ? `Something went wrong: ${isFree.error}` : "Something went wrong. Please try again or use you're own API key.");
          return
        }
      }

      // Reset states at the beginning
      setIsLoading(true);
      setConnectionStatus("connecting");
      setReconnectAttempts(0);

      // Input validation
      if (!websiteUrl.trim()) {
        alert("Please enter a website URL");
        return;
      }

      if (!apiKey.trim() && !endpointMode) {
        alert("Please enter your API key");
        return;
      }

      setIsAnalyzing(true);

      // Generate session ID
      let sessionId = "";
      if (apiKey.startsWith("TEST")) {
        sessionId = "test_" + apiKey;
      } else if (apiKey === "FREE-TRIAL") {
        // Generate a random string
        const randomString = Math.random().toString(36).substring(2, 10);
        sessionId = "test_" + apiKey + randomString;
      } else {
        try {
          const data = await getId();
          if (!data?.sessionId) {
            throw new Error("Failed to get session ID");
          }
          sessionId = data.sessionId;
        } catch (error) {
          alert("❌ Failed to generate session ID");
          throw error;
        }
      }

      setSessionId(sessionId);
      const testMode = apiKey.startsWith("TEST");

      // Setup API key with better error handling
      // Only setup API key is not in endpoint mode (or using advanced endpoint mode)
      if (!apiKey.startsWith("TEST") && apiKey !== "FREE-TRIAL") {
        if (!endpointMode || (endpointMode && apiKey)) {
          try {
            // First, get the public key from the server
            const keyResponse = await axios.get(`${baseUrl}/public-key`);
            const publicKey = keyResponse.data.publicKey;

            // Encrypt the API key
            const encryptedApiKey = await encryptApiKey(apiKey, publicKey);

            const response2 = await axios.post(
              `${baseUrl}/setup-key/${sessionId}`,
              {
                encryptedApiKey: encryptedApiKey,
                testKey: testKey,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
                timeout: 30000,
              }
            );

            if (!response2?.data?.success) {
              throw new Error(
                response2?.data?.message || "API key setup failed"
              );
            }
          } catch (error) {
            alert("❌ API key setup failed. Please check your key and try again.");
            throw error;
          }
        }
      }

      // Determine endpoint
      let endPoint = `start/${sessionId}`;
      if (apiKey.startsWith("TEST") || apiKey == "FREE-TRIAL" || apiKey.startsWith("FREE-TRIAL")) {
        endPoint = `test/${apiKey}`;
      }

      // Clear the API key from memory immediately after setup
      setApiKey("");

      // Prepare the request payload
      const requestPayload = {
        goal: goal,
        url: websiteUrl,
        data: getAdditionalData(),
      };

      // Start analysis with proper timeout and error handling
      const response = await axios.post(
        `${baseUrl}/${endPoint}`,
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minutes for initial setup (browser launch can be slow)
        }
      );

      // Validate response structure
      if (!response?.data) {
        throw new Error("Empty response from server");
      }

      // Extract session ID and validate
      const freshSessionId = response.data.sessionId;
      if (!freshSessionId) {
        throw new Error("No session ID returned from server");
      }

      console.log("✅ Analysis started, session ID:", freshSessionId);
      setSessionId(freshSessionId);

      // Setup WebSocket URL
      const url = new URL(baseUrl);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}/websocket?sessionId=${freshSessionId}`;
      setWebsocketUrl(cleanBaseUrlWithPort);

      // Update connection status
      setConnectionStatus("connected");
      addCrawlerConfig(goal, websiteUrl, testMode, false, false, detailed, endpointMode, optimizeImage, crossPlatform);

    } catch (error) {
      setStarting(false)
      const errorMessage = getErrorMessage(error);
      console.error("❌ Error starting session:", errorMessage);

      // Handle different types of errors
      if (errorMessage.includes("timeout")) {
        alert(
          `⏱️ Connection timed out. This might be due to high server load or slow browser startup. The session may still be initializing in the background so try reconnecting.`
        );
        setConnectionStatus("error");
      } else if (errorMessage.includes("Network Error") || errorMessage.includes("ECONNREFUSED")) {
        alert(`🌐 Network connection error. Please check your internet connection and server availability.`);
        setConnectionStatus("error");
        stopAnalysis();
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        alert(`🔑 Authentication failed. Please check your API key.`);
        setConnectionStatus("error");
        stopAnalysis();
      } else if (errorMessage.includes("429")) {
        alert(`⏳ Rate limit exceeded. Please wait a moment and try again.`);
        setConnectionStatus("error");

      } else {
        alert(`❌ Error starting session: ${errorMessage}`);
        setConnectionStatus("error");
        stopAnalysis();
      }
    } finally {
      setIsLoading(false);
      setStarting(false);
      startingRef.current = false; // Reset the reference
    }
  };

  const getId = async () => {
    try {
      const response = await axios.get(`${baseUrl}/start`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      alert(`❌ Error getting session ID: ${errorMessage}`);
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
                    <li>3. Enter your testing goals e.g Crawl the Entire Site and Test it</li>
                    <li>4. Click "Start Analysis" to begin the process</li>
                    <li>5. Monitor real-time progress and results</li>
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
            <p className="text-xs text-gray-500 mb-2">
              Enter the URL of the website you want to analyze e.g
              https://example.com
            </p>
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
            <p className="text-xs text-gray-500 mb-2">
              Enter your Gemini API key (The agent uses Gemini to generate responses). Use FREE-TRIAL to test out the agent for free
            </p>
            <input
              type="password"
              placeholder="Enter your API key e.g FREE-TRIAL"
              value={apiKey}
              onChange={(e) => e.target.value === "FREE-TRIAL" ? setApiKey("TEST-FREE-TRIAL") : setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal of the Agent
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Enter your testing goal e.g Crawl the Entire Site and Test it
            </p>
            <input
              type="string"
              placeholder="Enter your Goal e.g Crawl the Entire Site and Test it"
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
                    disabled={isAnalyzing || configFile !== null}
                    className="sr-only"
                  />
                  <div
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${detailed ? "bg-blue-600" : "bg-gray-300"
                      } ${isAnalyzing || configFile !== null
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
                    {configFile && <span className="ml-2 text-xs text-blue-600">(from config)</span>}
                  </span>
                </label>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Enable detailed analysis to get comprehensive results on every UI
              element per page.
              <span className="font-medium">
                {" "}
                Note: This will take more time to complete.
              </span>
            </p>
          </div>

          {/* Cross-Platform Switch */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crossPlatform}
                    onChange={(e) => setCrossPlatform(e.target.checked)}
                    disabled={isAnalyzing || configFile !== null}
                    className="sr-only"
                  />
                  <div
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${endpointMode ? "bg-blue-600" : "bg-gray-300"
                      } ${isAnalyzing || configFile !== null
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                      }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${endpointMode ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Cross Platform
                    {configFile && <span className="ml-2 text-xs text-blue-600">(from config)</span>}
                  </span>
                </label>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Enable cross-platform analysis for agent to test on multiple platforms (Mobile, Desktop and Tablet).
            </p>
          </div>

          {/* More Information Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setMoreInfoExpanded(!moreInfoExpanded)}
              disabled={isAnalyzing}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <div>
                <h4 className="font-medium text-gray-800">
                  More Options
                </h4>
                <p>
                  Further control over the analysis process
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

            {moreInfoExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="space-y-3 mt-4">
                  {/* Endpoint Mode Switch */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={endpointMode}
                            onChange={(e) => setEndpointMode(e.target.checked)}
                            disabled={isAnalyzing || configFile !== null}
                            className="sr-only"
                          />
                          <div
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${endpointMode ? "bg-blue-600" : "bg-gray-300"
                              } ${isAnalyzing || configFile !== null
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                              }`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${endpointMode ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            Endpoint Mode
                            {configFile && <span className="ml-2 text-xs text-blue-600">(from config)</span>}
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Use Endpoint mode if you're testing API endpoints instead of a website (or a visual element).
                    </p>
                  </div>

                  {/* Optimize Images Switch */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={optimizeImage}
                            onChange={(e) => setOptimizeImage(e.target.checked)}
                            disabled={isAnalyzing || configFile !== null}
                            className="sr-only"
                          />
                          <div
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${endpointMode ? "bg-blue-600" : "bg-gray-300"
                              } ${isAnalyzing || configFile !== null
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                              }`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${endpointMode ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            Optimize Images
                            {configFile && <span className="ml-2 text-xs text-blue-600">(from config)</span>}
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Optimize images on a page. It will lead to more accurate results but take more time.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                <p>
                  Add custom key-value pairs to provide extra content for the agent to use. Check out our{' '}
                  <a
                    href="/docs/web/configuration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    documentation
                  </a>{' '}
                  for more information (optional)
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

          {/* Config File Upload Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setConfigFileExpanded(!configFileExpanded)}
              disabled={isAnalyzing}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <div>
                <h4 className="font-medium text-gray-800">
                  Config File Upload
                </h4>
                <p className="text-sm text-gray-600">
                  Upload a JSON config file to auto-populate settings (optional)
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${configFileExpanded ? "rotate-180" : ""
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

            {configFileExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="space-y-3 mt-4">
                  {!configFile ? (
                    <div>
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleConfigFileUpload}
                            disabled={isAnalyzing}
                            className="hidden"
                          />
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JSON file only
                          </p>
                        </div>
                      </label>
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Expected format:</span> Upload a JSON config with fields like goal, key, url, detailed, and data object.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <svg
                            className="w-5 h-5 text-green-600 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Config file loaded
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              {configFileName}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={clearConfigFile}
                          disabled={isAnalyzing}
                          className={`text-red-600 hover:text-red-800 ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
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
