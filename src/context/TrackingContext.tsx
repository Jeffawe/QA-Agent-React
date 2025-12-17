import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { trackQACall, updateQACall } from '../pages/updates/functions';
import { TrackingContext } from './useTracking';
import type { StartTrackingParams, StopTrackingParams, TrackingContextValue, } from '../types';

const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Use refs to avoid stale closures and prevent unnecessary callback recreations
  const isTrackingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Sync refs with state (only when state actually changes)
  // This keeps refs in sync without triggering re-renders
  isTrackingRef.current = isTracking;
  sessionIdRef.current = sessionId;

  const startTracking = useCallback(async (params: StartTrackingParams) => {
    try {
      startTimeRef.current = Date.now();

      const trackResult = await trackQACall({
        website_url: params.website_url,
        session_id: params.session_id,
        goal: params.goal,
        detailed: params.detailed,
        cross_platform: params.cross_platform,
        optimize_images: params.optimize_images,
        usage_type: params.usage_type,
      });

      if (!trackResult.success) {
        console.error("Failed to track QA call:", trackResult.message);
        startTimeRef.current = null;
        return;
      }

      // Update state + refs
      setIsTracking(true);
      setSessionId(params.session_id);
      sessionIdRef.current = params.session_id;
      isTrackingRef.current = true;
    } catch (error) {
      console.error("❌ Error in startTracking:", error);
      startTimeRef.current = null;
    }
  }, []);

  const stopTracking = useCallback(async (params?: StopTrackingParams) => {
    if (!isTrackingRef.current || !sessionIdRef.current) {
      console.warn("⚠️ No active tracking session to stop");
      return;
    }

    try {
      const duration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : undefined;

      const updateResult = await updateQACall({
        session_id: sessionIdRef.current,
        status: "completed",
        duration_seconds: duration,
        pages_crawled: params?.pages_crawled,
        tests_run: params?.tests_run,
        issues_found: params?.issues_found,
      });

      if (!updateResult.success) {
        console.error("❌ Failed to update QA call on stop:", updateResult.message);
      } else {
        console.log("✅ Tracking stopped successfully");
      }
    } catch (error) {
      console.error("❌ Error in stopTracking:", error);
    } finally {
      // Always reset everything
      setIsTracking(false);
      setSessionId(null);
      startTimeRef.current = null;
      isTrackingRef.current = false;
      sessionIdRef.current = null;
    }
  }, []);

  const stopTrackingOnFail = useCallback(async (error: string) => {
    if (!isTrackingRef.current || !sessionIdRef.current) {
      console.warn("⚠️ No active tracking session to fail");
      return;
    }

    try {
      const updateResult = await updateQACall({
        session_id: sessionIdRef.current,
        status: "failed",
        error_message: error,
      });

      if (!updateResult.success) {
        console.error("❌ Failed to update QA call on failure:", updateResult.message);
      } else {
        console.log("✅ Tracking stopped on failure");
      }
    } catch (err) {
      console.error("❌ Error in stopTrackingOnFail:", err);
    } finally {
      setIsTracking(false);
      setSessionId(null);
      startTimeRef.current = null;
      isTrackingRef.current = false;
      sessionIdRef.current = null;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<TrackingContextValue>(
    () => ({
      startTracking,
      stopTracking,
      stopTrackingOnFail,
      isTracking,
      sessionId,
      startTime: startTimeRef.current,
    }),
    [
      startTracking,
      stopTracking,
      stopTrackingOnFail,
      isTracking,
      sessionId,
    ]
  );

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

export default TrackingProvider;