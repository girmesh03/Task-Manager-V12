import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Components
import LoadingFallback from "./components/LoadingFallback.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Root App - not lazy loaded as it's always needed
import App from "./App.jsx";

// Lazy load all route components
const AuthLayout = lazy(() => import("./layouts/AuthLayout.jsx"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Statistics = lazy(() => import("./pages/Statistics.jsx"));

// Wrapper component for Suspense boundaries
const SuspenseWrapper = ({ children, fallbackMessage }) => (
  <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
    <ErrorBoundary fallbackMessage="Failed to load this section">
      {children}
    </ErrorBoundary>
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: (
          <SuspenseWrapper fallbackMessage="Loading authentication...">
            <AuthLayout />
          </SuspenseWrapper>
        ),
        children: [
          {
            path: "",
            element: (
              <SuspenseWrapper fallbackMessage="Loading home page...">
                <Home />
              </SuspenseWrapper>
            ),
          },
          {
            path: "login",
            element: (
              <SuspenseWrapper fallbackMessage="Loading login page...">
                <Login />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: "",
        element: (
          <SuspenseWrapper fallbackMessage="Loading dashboard...">
            <DashboardLayout />
          </SuspenseWrapper>
        ),
        children: [
          {
            path: "statistics",
            element: (
              <SuspenseWrapper fallbackMessage="Loading statistics...">
                <Statistics />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary fallbackMessage="Failed to initialize the application">
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);