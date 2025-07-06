/**
 * Error logging utilities for production error tracking
 *
 * This module provides functions to log errors to external services
 * in production while maintaining privacy and security.
 */

/**
 * Logs errors to an external service (placeholder implementation)
 * In a real application, you would integrate with services like:
 * - Sentry
 * - LogRocket
 * - Bugsnag
 * - Custom logging endpoint
 */
export const logErrorToService = (error, errorInfo, context = {}) => {
  const isDevelopment = import.meta.env.MODE === "development";

  // Don't log to external services in development
  if (isDevelopment) {
    return;
  }

  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    context,
    // Add any additional context you need
    userId: context.userId || "anonymous",
    sessionId: context.sessionId || "unknown",
  };

  // Example: Send to your logging service
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorData)
  // }).catch(console.error);

  // Example: Send to Sentry (if using Sentry SDK)
  // Sentry.captureException(error, {
  //   contexts: { errorInfo, ...context }
  // });

  console.error("Error logged:", errorData);
};

/**
 * Logs route errors specifically
 */
export const logRouteError = (error, route) => {
  logErrorToService(error, null, {
    type: "route_error",
    route,
    status: error?.status,
  });
};

/**
 * Logs chunk loading errors (common with code splitting)
 */
export const logChunkError = (error) => {
  logErrorToService(error, null, {
    type: "chunk_load_error",
    isChunkError: true,
  });
};
