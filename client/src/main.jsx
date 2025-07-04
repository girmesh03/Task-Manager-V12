import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Root
import App from "./App.jsx";

// Layouts
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Public Routes
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";

// Protected Routes
import Statistics from "./pages/Statistics.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: "statistics",
            element: <Statistics />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
