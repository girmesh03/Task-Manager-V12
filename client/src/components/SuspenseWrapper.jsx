import { Suspense } from "react";
import LoadingFallback from "./LoadingFallback.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

/**
 * SuspenseWrapper - A reusable component that combines Suspense and ErrorBoundary
 * 
 * This component provides:
 * - Loading states for lazy-loaded components
 * - Error boundaries for component-level error handling
 * - Consistent fallback UI across the application
 * 
 * @param {React.ReactNode} children - The components to wrap
 * @param {string} fallbackMessage - Custom loading message
 * @param {string} errorMessage - Custom error message
 * @param {string} errorTitle - Custom error title
 */
const SuspenseWrapper = ({ 
  children, 
  fallbackMessage = "Loading...",
  errorMessage = "Failed to load this section",
  errorTitle = "Loading Error"
}) => (
  <ErrorBoundary 
    fallbackMessage={errorMessage}
    title={errorTitle}
  >
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export default SuspenseWrapper;