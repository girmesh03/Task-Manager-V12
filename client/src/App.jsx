import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";

// Theme customizations and provider
import AppTheme from "./shared-theme/AppTheme";

// Root layout
import RootLayout from "./layouts/RootLayout";

// Components
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SuspenseWrapper from "./components/SuspenseWrapper.jsx";
import RouteError from "./components/RouteError.jsx";

// Lazy load layouts
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

// Public routes
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Private routes
const Statistics = lazy(() => import("./pages/Statistics"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Routines = lazy(() => import("./pages/Routines"));
const Users = lazy(() => import("./pages/Users"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
          {
            path: "register",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading register page..."
                errorMessage="Failed to load register page"
                errorTitle="Register Page Error"
              >
                <Register />
              </SuspenseWrapper>
            ),
          },
          {
            path: "verify-email",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading verify email page..."
                errorMessage="Failed to load verify email page"
                errorTitle="Verify Email Page Error"
              >
                <VerifyEmail />
              </SuspenseWrapper>
            ),
          },
          {
            path: "forgot-password",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading forgot password page..."
                errorMessage="Failed to load forgot password page"
                errorTitle="Forgot Password Page Error"
              >
                <ForgotPassword />
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
          {
            path: "tasks",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading tasks..."
                errorMessage="Failed to load tasks page"
                errorTitle="Tasks Error"
              >
                <Tasks />
              </SuspenseWrapper>
            ),
          },
          {
            path: "routines",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading routines..."
                errorMessage="Failed to load routines page"
                errorTitle="Routines Error"
              >
                <Routines />
              </SuspenseWrapper>
            ),
          },
          {
            path: "users",
            element: (
              <SuspenseWrapper
                fallbackMessage="Loading users..."
                errorMessage="Failed to load users page"
                errorTitle="Users Error"
              >
                <Users />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const App = () => {
  console.log("App");
  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <ErrorBoundary
        fallbackMessage="Failed to initialize the application. Please refresh the page."
        title="Application Error"
      >
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AppTheme>
  );
};

export default App;