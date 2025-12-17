import { createContext, useContext } from "react";
import type { TrackingContextValue } from "../types";

export const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

const useTracking = (): TrackingContextValue => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
};

export default useTracking;