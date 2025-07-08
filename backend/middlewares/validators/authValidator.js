// backend/middlewares/validators/authValidator.js
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

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const validateRegister = [
  body("companyData.name").notEmpty().withMessage("Company name is required"),
  body("companyData.email").isEmail().withMessage("Invalid email format"),
  body("companyData.phone").notEmpty().withMessage("Phone number is required"),
  body("companyData.address").notEmpty().withMessage("Address is required"),
  body("companyData.size").notEmpty().withMessage("Company size is required"),
  body("companyData.industry")
    .notEmpty()
    .withMessage("Company industry is required"),
  body("userData.adminFirstName")
    .notEmpty()
    .withMessage("First name is required"),
  body("userData.adminLastName")
    .notEmpty()
    .withMessage("Last name is required"),
  body("userData.adminPosition").notEmpty().withMessage("Position is required"),
  body("userData.departmentName")
    .notEmpty()
    .withMessage("Department name is required"),
  body("userData.adminEmail").isEmail().withMessage("Invalid email format"),
  body("userData.adminPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];
