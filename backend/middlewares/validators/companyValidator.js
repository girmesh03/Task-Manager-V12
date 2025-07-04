// backend/middlewares/validators/companyValidator.js
import { body, validationResult } from "express-validator";
import CustomError from "../../errorHandler/CustomError.js";
import ERROR_CODES from "../../constants/ErrorCodes.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(
      new CustomError(
        `Validation Error: ${errorMessages.join(", ")}`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      )
    );
  }
  next();
};

export const validateSubscription = [
  body("companyData.name").notEmpty().withMessage("Company name is required"),
  body("companyData.email")
    .isEmail()
    .withMessage("Invalid company email format"),
  body("userData.adminEmail")
    .isEmail()
    .withMessage("Invalid admin email format"),
  body("userData.adminPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];
