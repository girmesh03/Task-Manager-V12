import { useRouteError, useNavigate, Link as RouterLink } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Paper,
  Divider,
  Chip
} from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from "@mui/icons-material";

/**
 * RouteError - Handles route-level errors from react-router-dom
 * 
 * This component handles different types of routing errors:
 * - 404 Not Found errors
 * - 401 Unauthorized errors  
 * - 403 Forbidden errors
 * - 500 Server errors
 * - Network/loading errors
 * - Generic routing errors
 */
const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Determine error type and appropriate response
  const getErrorInfo = () => {
    // Handle different error types
    if (error?.status === 404) {
      return {
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        severity: "warning",
        icon: <WarningIcon />,
        showRetry: false,
        showHome: true,
        showBack: true
      };
    }

    if (error?.status === 401) {
      return {
        title: "Unauthorized Access",
        message: "You need to log in to access this page.",
        severity: "error",
        icon: <ErrorIcon />,
        showRetry: false,
        showHome: true,
        showBack: false,
        customAction: {
          label: "Go to Login",
          path: "/login"
        }
      };
    }

    if (error?.status === 403) {
      return {
        title: "Access Forbidden",
        message: "You don't have permission to access this resource.",
        severity: "error",
        icon: <ErrorIcon />,
        showRetry: false,
        showHome: true,
        showBack: true
      };
    }

    if (error?.status >= 500) {
      return {
        title: "Server Error",
        message: "Something went wrong on our end. Please try again later.",
        severity: "error",
        icon: <ErrorIcon />,
        showRetry: true,
        showHome: true,
        showBack: true
      };
    }

    // Handle chunk loading errors (common with lazy loading)
    if (error?.message?.includes("Loading chunk") || 
        error?.message?.includes("ChunkLoadError")) {
      return {
        title: "Loading Error",
        message: "Failed to load application resources. This might be due to a network issue or an app update.",
        severity: "warning",
        icon: <WarningIcon />,
        showRetry: true,
        showHome: true,
        showBack: false,
        customAction: {
          label: "Reload Application",
          action: () => window.location.reload()
        }
      };
    }

    // Generic error fallback
    return {
      title: "Something Went Wrong",
      message: error?.message || "An unexpected error occurred while loading this page.",
      severity: "error",
      icon: <ErrorIcon />,
      showRetry: true,
      showHome: true,
      showBack: true
    };
  };

  const errorInfo = getErrorInfo();
  const isDevelopment = import.meta.env.MODE === "development";

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: 3,
        gap: 3,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 4,
          maxWidth: 600,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Error Status Badge */}
        {error?.status && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Error ${error.status}`}
              color={errorInfo.severity}
              variant="outlined"
              icon={errorInfo.icon}
            />
          </Box>
        )}

        {/* Main Error Content */}
        <Alert 
          severity={errorInfo.severity}
          icon={errorInfo.icon}
          sx={{ 
            mb: 3,
            textAlign: "left",
            "& .MuiAlert-message": { width: "100%" }
          }}
        >
          <Typography variant="h6" gutterBottom>
            {errorInfo.title}
          </Typography>
          <Typography variant="body2">
            {errorInfo.message}
          </Typography>
        </Alert>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Chip label="Development Info" size="small" />
            </Divider>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Error Details:
              </Typography>
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  display: "block",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  backgroundColor: "grey.100",
                  p: 1,
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                {error.stack || error.toString()}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Action Buttons */}
        <Box 
          sx={{ 
            display: "flex", 
            gap: 2, 
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          {errorInfo.showRetry && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Try Again
            </Button>
          )}

          {errorInfo.customAction && (
            <Button
              variant="contained"
              onClick={errorInfo.customAction.action || (() => navigate(errorInfo.customAction.path))}
            >
              {errorInfo.customAction.label}
            </Button>
          )}

          {errorInfo.showBack && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Go Back
            </Button>
          )}

          {errorInfo.showHome && (
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              component={RouterLink}
              to="/"
              onClick={handleHome}
            >
              Home
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RouteError;