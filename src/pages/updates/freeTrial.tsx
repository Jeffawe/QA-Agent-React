const checkUsageLink = import.meta.env.VITE_SERVERLESS_FUNCTION;

interface UsageResponse {
  success?: boolean;
  testId?: string;
  remainingDailyUses?: number;
  remainingMonthlyUses?: number;
  limitResetDaily?: string;
  limitResetMonthly?: string;
  error?: string;
  message?: string;
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
      return { error: data.error || 'Failed to check usage', message: data.message };
    }

    return data;
  } catch (error) {
    console.error('Usage check failed:', error);
    return { error: 'Failed to connect to service' };
  }
};

export default usageTracker;