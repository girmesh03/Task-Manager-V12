const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_EXISTS: "RESOURCE_EXISTS",
  OPERATION_FAILED: "OPERATION_FAILED",
  SERVER_ERROR: "SERVER_ERROR",
  INVALID_ID: "INVALID_ID",
  DUPLICATE_FIELD: "DUPLICATE_FIELD",
  // VALIDATION_FAILED is duplicated, VALIDATION_ERROR is more generic for all validation issues.
  // Keeping VALIDATION_ERROR and removing the specific VALIDATION_FAILED for now.
  // If more granular validation error types are needed, they can be added.
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  RATE_LIMITED: "RATE_LIMITED",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND", // Added for consistency
  // Add more generic codes as needed
};

export default ERROR_CODES;
