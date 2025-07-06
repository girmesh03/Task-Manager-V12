import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Components
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SuspenseWrapper from "./components/SuspenseWrapper.jsx";
import RouteError from "./components/RouteError.jsx";

// Root App - not lazy loaded as it's always needed
import App from "./App.jsx";

// Lazy load all route components for optimal performance
const AuthLayout = lazy(() => import("./layouts/AuthLayout.jsx"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Statistics = lazy(() => import("./pages/Statistics.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />, // Global route error handler
    children: [
      {
        element: (
          <SuspenseWrapper 
            fallbackMessage="Loading authentication..."
            errorMessage="Failed to load authentication system"
            errorTitle="Authentication Error"
          >
            <AuthLayout />
          </SuspenseWrapper>
        ),
        errorElement: <RouteError />, // Auth-specific error handler
        children: [
          {
            path: "",
            element: (
              <SuspenseWrapper 
                fallbackMessage="Loading home page..."
                errorMessage="Failed to load home page"
                errorTitle="Home Page Error"
              >
                <Home />
              </SuspenseWrapper>
            ),
          },
          {
            path: "login",
            element: (
              <SuspenseWrapper 
                fallbackMessage="Loading login page..."
                errorMessage="Failed to load login page"
                errorTitle="Login Page Error"
              >
                <Login />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper 
            fallbackMessage="Loading dashboard..."
            errorMessage="Failed to load dashboard"
            errorTitle="Dashboard Error"
          >
            <DashboardLayout />
          </SuspenseWrapper>
        ),
        errorElement: <RouteError />, // Dashboard-specific error handler
        children: [
          {
            path: "statistics",
            element: (
              <SuspenseWrapper 
                fallbackMessage="Loading statistics..."
                errorMessage="Failed to load statistics page"
                errorTitle="Statistics Error"
              >
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
    <ErrorBoundary 
      fallbackMessage="Failed to initialize the application. Please refresh the page."
      title="Application Error"
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);