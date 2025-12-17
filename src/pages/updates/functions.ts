import axios from "axios";

const usageLink = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const track_link = import.meta.env.VITE_SUPABASE_TRACK_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface TrackUsageParams {
  websiteUrl: string;
  goal?: string;
  free: boolean; // true = free_trial, false = test_key
  apiKeyHash?: string; // For test keys, pass SHA-256 hash
  sessionId?: string;
}

interface TrackUsageResponse {
  success: boolean;
  message: string;
  usage_count?: number;
  limit_reached?: boolean;
  remaining_uses?: number;
  error?: string;
}

/**
 * Generate a browser fingerprint for additional tracking
 * This helps prevent abuse even if users use VPNs
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || "unknown",
    navigator.platform,
  ];

  // Simple hash function (you might want to use a proper hash library)
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get user's IP address (client-side - will be validated server-side)
 * Note: This is a fallback; the edge function will use the actual request IP
 */
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn("Could not fetch client IP:", error);
    return null;
  }
}

/**
 * Hash a string using SHA-256 (for API keys)
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Track usage by calling the Supabase edge function
 * 
 * @param params - Tracking parameters
 * @returns Response indicating success and usage limits
 */
export async function trackUsage(
  params: TrackUsageParams
): Promise<TrackUsageResponse> {
  try {
    const { websiteUrl, goal, free, apiKeyHash, sessionId } = params;

    // Validate inputs
    if (!websiteUrl || !websiteUrl.trim()) {
      return {
        success: false,
        message: "Website URL is required",
        error: "Invalid input",
      };
    }

    // Generate fingerprint
    const fingerprint = generateFingerprint();

    // Get client IP (optional, server will use request IP)
    const clientIP = await getClientIP();

    // Prepare request body
    const requestBody = {
      ip_address: clientIP || undefined,
      user_agent: navigator.userAgent,
      fingerprint,
      usage_type: free ? "free_trial" : "test_key",
      website_url: websiteUrl,
      goal: goal || undefined,
      api_key_hash: apiKeyHash || undefined,
      session_id: sessionId || undefined,
    };

    if (!usageLink) {
      console.error("Usage link not found");
      return {
        success: false,
        message: "Usage link not found",
        error: "Invalid input",
      };
    }

    const response = await fetch(usageLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data: TrackUsageResponse = await response.json();

    // Handle limit reached
    if (data.limit_reached) {
      console.warn("Usage limit reached:", data);
      return {
        success: false,
        message: data.message || "Free trial limit reached",
        usage_count: data.usage_count,
        limit_reached: true,
        remaining_uses: 0,
      };
    }

    // Handle other errors
    if (!data.success) {
      console.error("Tracking failed:", data);
      return {
        success: false,
        message: data.message || "Failed to track usage",
        error: data.error,
      };
    }

    // Success
    console.log("Usage tracked successfully:", data);
    return data;

  } catch (error) {
    console.error("Error tracking usage:", error);
    return {
      success: false,
      message: "Failed to track usage",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Utility function to hash an API key before passing to trackUsage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return hashString(apiKey);
}

export async function encryptApiKey(apiKey: string, publicKey: string) {
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

export const getErrorMessage = (error: unknown): string => {
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


// ============================================
// TYPESCRIPT CLIENT: QA Agent Call Tracker
// ============================================

interface TrackQACallParams {
  // Required
  website_url: string;
  session_id: string;

  // Optional
  goal?: string;

  // Configuration flags
  detailed?: boolean;
  endpoint_mode?: boolean;
  cross_platform?: boolean;
  optimize_images?: boolean;

  // Usage type
  usage_type?: "free_trial" | "test_key" | "production";

  // Additional custom data
  additional_data?: Record<string, string>;
}

interface UpdateQACallParams {
  session_id: string;
  status: "completed" | "failed" | "stopped";
  duration_seconds?: number;
  pages_crawled?: number;
  tests_run?: number;
  issues_found?: number;
  error_message?: string;
}

interface QACallResponse {
  success: boolean;
  message: string;
  call_id?: string;
  error?: string;
}

/**
 * Track the start of a QA Agent call
 * Call this when the user starts an analysis
 * 
 * @param params - QA call parameters
 * @returns Response indicating success
 */
export async function trackQACall(
  params: TrackQACallParams
): Promise<QACallResponse> {
  try {
    const {
      website_url,
      session_id,
      goal,
      detailed,
      endpoint_mode,
      cross_platform,
      optimize_images,
      usage_type,
      additional_data,
    } = params;

    // Validate required fields
    if (!website_url || !session_id) {
      return {
        success: false,
        message: "website_url and session_id are required",
        error: "Validation error",
      };
    }

    // Generate fingerprint
    const fingerprint = generateFingerprint();

    // Prepare request body
    const requestBody = {
      website_url,
      session_id,
      goal: goal || undefined,
      user_agent: navigator.userAgent,
      fingerprint,
      detailed: detailed || false,
      endpoint_mode: endpoint_mode || false,
      cross_platform: cross_platform || false,
      optimize_images: optimize_images || false,
      usage_type: usage_type || "production",
      api_key_hash: undefined,
      additional_data: additional_data || undefined,
      status: "started",
    };

    const response = await fetch(track_link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data: QACallResponse = await response.json();

    if (!data.success) {
      console.error("QA call tracking failed:", data);
      return data;
    }

    console.log("QA call tracked successfully:", data);
    return data;

  } catch (error) {
    console.error("Error tracking QA call:", error);
    return {
      success: false,
      message: "Failed to track QA call",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Update a QA Agent call when it completes
 * Call this when the analysis finishes, fails, or is stopped
 * 
 * @param params - Update parameters
 * @returns Response indicating success
 */
export async function updateQACall(
  params: UpdateQACallParams
): Promise<QACallResponse> {
  try {
    const {
      session_id,
      status,
      duration_seconds,
      pages_crawled,
      tests_run,
      issues_found,
      error_message,
    } = params;

    // Validate required fields
    if (!session_id || !status) {
      return {
        success: false,
        message: "session_id and status are required",
        error: "Validation error",
      };
    }

    // Prepare request body
    const requestBody = {
      session_id,
      status,
      duration_seconds: duration_seconds || undefined,
      pages_crawled: pages_crawled || undefined,
      tests_run: tests_run || undefined,
      issues_found: issues_found || undefined,
      error_message: error_message || undefined,
    };

    const response = await fetch(track_link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data: QACallResponse = await response.json();

    if (!data.success) {
      console.error("QA call update failed:", data);
      return data;
    }

    console.log("QA call updated successfully:", data);
    return data;

  } catch (error) {
    console.error("Error updating QA call:", error);
    return {
      success: false,
      message: "Failed to update QA call",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Track when analysis starts
const startTime = Date.now();

const trackResult = await trackQACall({
  website_url: "https://example.com",
  session_id: "session_abc123",
  goal: "Crawl entire site and test it",
  detailed: true,
  cross_platform: false,
  optimize_images: true,
  usage_type: "free_trial",
  additional_data: {
    custom_field: "custom_value",
    test_type: "comprehensive",
  },
});

if (!trackResult.success) {
  console.error("Failed to track QA call:", trackResult.message);
}

// ... Run your QA agent ...

// Example 2: Update when analysis completes
const duration = Math.floor((Date.now() - startTime) / 1000);

const updateResult = await updateQACall({
  session_id: "session_abc123",
  status: "completed",
  duration_seconds: duration,
  pages_crawled: 42,
  tests_run: 156,
  issues_found: 8,
});

// Example 3: Update when analysis fails
const updateFailResult = await updateQACall({
  session_id: "session_abc123",
  status: "failed",
  error_message: "Connection timeout",
});

// Example 4: Integration with your existing startWebAnalysis function
async function startWebAnalysis() {
  const sessionId = generateSessionId(); // Your existing function
  const startTime = Date.now();
  
  try {
    // Track the start of the call
    await trackQACall({
      website_url: websiteUrl,
      session_id: sessionId,
      goal: goal,
      detailed: detailed,
      endpoint_mode: endpointMode,
      cross_platform: crossPlatform,
      optimize_images: optimizeImage,
      usage_type: isFreeTrialUser ? "free_trial" : "production",
      additional_data: getAdditionalData(), // Your existing function
    });
    
    // Start your analysis
    const response = await axios.post(`${baseUrl}/start/${sessionId}`, {
      // ... your existing code
    });
    
    // When analysis completes successfully
    await updateQACall({
      session_id: sessionId,
      status: "completed",
      duration_seconds: Math.floor((Date.now() - startTime) / 1000),
      pages_crawled: response.data.pages_crawled,
      tests_run: response.data.tests_run,
      issues_found: response.data.issues_found,
    });
    
  } catch (error) {
    // When analysis fails
    await updateQACall({
      session_id: sessionId,
      status: "failed",
      duration_seconds: Math.floor((Date.now() - startTime) / 1000),
      error_message: error.message,
    });
  }
}

// Example 5: Track when user stops analysis
async function stopAnalysis(sessionId: string, startTime: number) {
  await updateQACall({
    session_id: sessionId,
    status: "stopped",
    duration_seconds: Math.floor((Date.now() - startTime) / 1000),
  });
}
*/