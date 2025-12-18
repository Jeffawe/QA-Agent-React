import type { ConfigFile, TabProps } from "../../types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { trackUsage, encryptApiKey, getErrorMessage } from "./functions";
import { ConnectionStatus } from "./web/usableComponents";
import AnalysisForm from "./web/AnalysisForm";
import ExplanationSection from "./web/explanationSection";
import PageAnalysisDisplay from "../PageAnalysisDisplay";
import useTracking from "../../context/useTracking"

const baseUrl = import.meta.env.VITE_API_URL;
const testKey = import.meta.env.VITE_UNIQUE_KEY;

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
  restartServer,
}) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [goal, setGoal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [, setStopping] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error" | "reconnecting"
  >("disconnected");
  const [detailed, setDetailed] = useState(false);
  const [endpointMode, setEndpointMode] = useState(false);
  const [crossPlatform, setCrossPlatform] = useState(false);
  const [optimizeImage, setOptimizeImage] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    { key: "", value: "", id: crypto.randomUUID() },
  ]);
  const [isStarting, setStarting] = useState(false);

  const { startTracking, stopTrackingOnFail } = useTracking();

  const connectedRef = useRef(connected);
  const startingRef = useRef(false);

  const MAX_RECONNECT_ATTEMPTS = 3;

  const handleConfigFileUpload = (configFile: ConfigFile | null, fileName: string) => {
    if (!configFile || !fileName) return;

    try {
      const parsed: ConfigFile = configFile;
      // Populate fields from config file (support both camelCase and hyphenated keys)
      if (parsed.url) setWebsiteUrl(parsed.url);
      if (parsed.goal) setGoal(parsed.goal);
      if (parsed.key) setApiKey(parsed.key);
      if (typeof parsed.endpoint === 'boolean') setEndpointMode(parsed.endpoint);
      if (typeof parsed.detailed === 'boolean') setDetailed(parsed.detailed);

      // optimizeImages can be provided as optimizeImages or optimize-images
      if (typeof parsed['optimize-images'] === 'boolean') {
        setOptimizeImage(parsed['optimize-images']);
      }

      // crossPlatform can be provided as crossPlatform or cross-platform
      if (typeof parsed['cross-platform'] === 'boolean') {
        setCrossPlatform(parsed['cross-platform']);
      }

      if (configFile && configFile.data) {
        Object.entries(configFile.data).forEach(([key, value]) => {
          const value_string = JSON.stringify(value);
          keyValuePairs.push({ key, value: value_string, id: crypto.randomUUID() });
        });
      }

      alert("✅ Config file loaded successfully!");
    } catch (error) {
      alert("❌ Invalid JSON file. Please check the file format.");
      console.error("Error parsing config file:", error);
    }
  };

  const getAdditionalData = () => {
    const data: { [key: string]: unknown } = {};

    // Add the detailed flag to the data object
    data.detailed = detailed;
    data.optimizeImages = optimizeImage;
    data.crossPlatform = crossPlatform;

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
      await stopTrackingOnFail("Stopped by user");
      setReconnectAttempts(0);
      setIsReconnecting(false);
      setSessionId("");
    } catch (error) {
      alert(`Error stopping analysis: ${getErrorMessage(error)}`);
    } finally {
      setStopping(false);
    }
  }, [disconnect, sessionId, stopTrackingOnFail]);

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
      restartServer();
      let local_api_key = apiKey

      if (startingRef.current || isStarting) {
        return;
      }

      startingRef.current = true;
      let usage_type: "free_trial" | "test_key" | "production" = "production"
      setStarting(true)

      // Check if the API key is a free trial
      if (local_api_key === "FREE-TRIAL") {
        const isFree = await trackUsage({
          websiteUrl: websiteUrl,
          goal: goal,
          free: true
        });
        usage_type = "free_trial"

        if (!isFree.success) {
          alert(isFree.error ? `Something went wrong` : "You have reached your free trial limit. Please use your own API key or become a tester.");
          return
        } else {
          local_api_key = `f_${testKey}`
        }
      }

      //Check if API key is a test key
      if (local_api_key.startsWith("TEST")) {
        const isTest = await trackUsage({
          websiteUrl: websiteUrl,
          goal: goal,
          free: false
        });
        usage_type = "test_key"

        if (!isTest.success) {
          alert(isTest.error ? `Something went wrong` : "You're not a test user.");
          return
        } else {
          local_api_key = `t_${testKey}`
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

      if (!local_api_key.trim() && !endpointMode) {
        alert("Please enter your API key");
        return;
      }

      setIsAnalyzing(true);

      // Generate session ID
      let sessionId = "";
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

      setSessionId(sessionId);

      // Setup API key with better error handling
      // Only setup API key is not in endpoint mode (or using advanced endpoint mode)
      if (!endpointMode || (endpointMode && local_api_key)) {
        try {
          // First, get the public key from the server
          const keyResponse = await axios.get(`${baseUrl}/public-key`);
          const publicKey = keyResponse.data.publicKey;

          // Encrypt the API key
          const encryptedApiKey = await encryptApiKey(local_api_key, publicKey);

          const response2 = await axios.post(
            `${baseUrl}/setup-key/${sessionId}`,
            {
              encryptedApiKey: encryptedApiKey
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

      // Clear the API key from memory immediately after setup
      setApiKey("");
      local_api_key = "";

      // Prepare the request payload
      const requestPayload = {
        goal: goal,
        url: websiteUrl,
        data: getAdditionalData(),
      };

      // Start analysis with proper timeout and error handling
      const response = await axios.post(
        `${baseUrl}/start/${sessionId}`,
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

      setSessionId(freshSessionId);

      // Setup WebSocket URL
      const url = new URL(baseUrl);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      const cleanBaseUrlWithPort = `${wsProtocol}//${url.hostname}/websocket?sessionId=${freshSessionId}`;
      setWebsocketUrl(cleanBaseUrlWithPort);

      // Update connection status
      setConnectionStatus("connected");
      await startTracking({
        website_url: websiteUrl,
        goal: goal,
        usage_type: usage_type,
        session_id: freshSessionId
      })

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
        await stopTrackingOnFail(errorMessage);
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
        await stopTrackingOnFail(errorMessage);
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


  return (
    <div className="space-y-6">
      <ExplanationSection />

      <AnalysisForm
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        goal={goal}
        setGoal={setGoal}
        detailed={detailed}
        setDetailed={setDetailed}
        endpointMode={endpointMode}
        setEndpointMode={setEndpointMode}
        crossPlatform={crossPlatform}
        setCrossPlatform={setCrossPlatform}
        optimizeImage={optimizeImage}
        setOptimizeImage={setOptimizeImage}
        isAnalyzing={isAnalyzing}
        onStart={startWebAnalysis}
        onStop={stopAnalysis}
        connected={connected}
        connectionStatus={connectionStatus}
        handleConfigFileUpload={handleConfigFileUpload}
        keyValuePairs={keyValuePairs}
        setKeyValuePairs={setKeyValuePairs}
        attemptReconnection={attemptReconnection}
        isReconnecting={isReconnecting}
      />

      {(connected || isAnalyzing) && (
        <ConnectionStatus status={connectionStatus} />
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
