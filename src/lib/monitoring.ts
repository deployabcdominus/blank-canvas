import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { 
  createBrowserRouter, 
  useLocation, 
  useNavigationType, 
  createRoutesFromChildren, 
  matchRoutes 
} from "react-router-dom";

/**
 * Initializes Sentry for error tracking and performance monitoring.
 * Uses environment variables for configuration.
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("Sentry DSN not found. Error tracking is disabled.");
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0, 
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    environment: import.meta.env.MODE,
    
    // Filter common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Failed to fetch',
    ],
  });
};

/**
 * Log meaningful business events to LogSnag or similar via custom implementation
 */
export const logEvent = async (channel: string, event: string, description: string, icon: string = "🔔", tags: Record<string, string> = {}) => {
  // Mock implementation for internal audit/log tracking until a specific provider is connected
  console.log(`[Event: ${channel}] ${icon} ${event}: ${description}`, tags);
  
  // Example for future LogSnag integration:
  // await fetch('https://api.logsnag.com/v1/log', { ... })
};
