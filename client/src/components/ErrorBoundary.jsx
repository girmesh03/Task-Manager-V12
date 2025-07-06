import React from "react";
import { Box, Typography, Button, Alert, Collapse } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    // Note: error parameter is available but we handle it in componentDidCatch
    console.log("getDerivedStateFromError", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details for debugging and display
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Environment-specific error handling
    const isDevelopment = import.meta.env.MODE === "development";

    if (isDevelopment) {
      console.group("🚨 ErrorBoundary caught an error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    } else {
      // In production, you might want to send errors to a logging service
      // Example: logErrorToService(error, errorInfo);
      console.error("Application error occurred:", error.message);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.MODE === "development";
      const { error, errorInfo } = this.state;

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: 3,
            gap: 2,
          }}
        >
          <Alert
            severity="error"
            sx={{
              width: "100%",
              maxWidth: 600,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="h6" gutterBottom>
              {this.props.title || "Something went wrong"}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {this.props.fallbackMessage ||
                "An unexpected error occurred while loading this section. Please try refreshing the page."}
            </Typography>

            {/* Development-only error details */}
            {isDevelopment && error && (
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={this.toggleDetails}
                  startIcon={
                    this.state.showDetails ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  }
                  sx={{ mb: 1 }}
                >
                  {this.state.showDetails ? "Hide" : "Show"} Error Details
                </Button>

                <Collapse in={this.state.showDetails}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "grey.100",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Error Message:
                    </Typography>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        display: "block",
                        mb: 2,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {error.toString()}
                    </Typography>

                    {errorInfo?.componentStack && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Component Stack:
                        </Typography>
                        <Typography
                          variant="caption"
                          component="pre"
                          sx={{
                            display: "block",
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "200px",
                            overflow: "auto",
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>

            <Button variant="outlined" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
=======
import React from "react";
import { Box, Typography, Button, Alert, Collapse } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    // Note: error parameter is available but we handle it in componentDidCatch
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details for debugging and display
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Environment-specific error handling
    const isDevelopment = import.meta.env.MODE === "development";
    
    if (isDevelopment) {
      console.group("🚨 ErrorBoundary caught an error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    } else {
      // In production, you might want to send errors to a logging service
      // Example: logErrorToService(error, errorInfo);
      console.error("Application error occurred:", error.message);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({ 
      showDetails: !prevState.showDetails 
    }));
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.MODE === "development";
      const { error, errorInfo } = this.state;

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: 3,
            gap: 2,
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              width: "100%", 
              maxWidth: 600,
              "& .MuiAlert-message": { width: "100%" }
            }}
          >
            <Typography variant="h6" gutterBottom>
              {this.props.title || "Something went wrong"}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {this.props.fallbackMessage ||
                "An unexpected error occurred while loading this section. Please try refreshing the page."}
            </Typography>

            {/* Development-only error details */}
            {isDevelopment && error && (
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={this.toggleDetails}
                  startIcon={this.state.showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  {this.state.showDetails ? "Hide" : "Show"} Error Details
                </Button>
                
                <Collapse in={this.state.showDetails}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "grey.100",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Error Message:
                    </Typography>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        display: "block",
                        mb: 2,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {error.toString()}
                    </Typography>

                    {errorInfo?.componentStack && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Component Stack:
                        </Typography>
                        <Typography
                          variant="caption"
                          component="pre"
                          sx={{
                            display: "block",
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "200px",
                            overflow: "auto",
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
