const checkUsageLink = import.meta.env.VITE_SERVERLESS_FUNCTION;
const usageLink = import.meta.env.VITE_USAGE_FUNCTION;

interface UsageResponse {
  success: boolean;
  testId?: string;
  remainingDailyUses?: number;
  remainingMonthlyUses?: number;
  limitResetDaily?: string;
  limitResetMonthly?: string;
  error?: string;
  message?: string;
}

export async function addCrawlerConfig(
  goal: string,
  url: string,
  testMode: boolean = false,
  autoStart: boolean = true,
  headless: boolean = true,
  detailed: boolean = false,
  endpoint: boolean = false,
  optimizeImages: boolean = false,
  crossPlatform: boolean = false
) {
  try {
    const response = await fetch(
      `${usageLink}/functions/v1/add-crawler-config`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SERVERLESS_TOKEN}`,
        },
        body: JSON.stringify({
          goal,
          url,
          testMode,
          autoStart,
          headless,
          detailed,
          endpoint,
          optimizeImages,
          crossPlatform,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add crawler config');
    }

    const result = await response.json();
    return result.data[0];
  }
  catch (error) {
    console.error('Error adding crawler config', error);
  }
}

const generateFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  const canvasData = canvas.toDataURL();

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData.slice(0, 50),
    screenResolution: `${window.screen.width}x${window.screen.height}`
  };

  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
};

const usageTracker = async (
  url: string,
  goal: string
): Promise<UsageResponse> => {
  try {
    const browserFingerprint = await generateFingerprint();

    const response = await fetch(
      checkUsageLink,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SERVERLESS_TOKEN}`
        },
        body: JSON.stringify({
          url,
          goal,
          browserFingerprint
        })
      }
    );

    const data: UsageResponse = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to check usage', message: data.message };
    }

    return data;
  } catch (error) {
    console.error('Usage check failed:', error);
    return { success: false, error: 'Failed to connect to service' };
  }
};

export default usageTracker;