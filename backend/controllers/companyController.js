import asyncHandler from "express-async-handler";
import Company from "../models/CompanyModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

// @desc    Register a new company (initial step of subscription)
// @route   POST /api/companies/register
// @access  Public
const createCompany = asyncHandler(async (req, res, next) => {
  const { name, address, phone, email } = req.body;

  try {
    // Check if company with the same email, name, or phone already exists
    const companyExistsBy = await Company.findOne({
      $or: [{ email }, { name }, { phone }],
    });

    // Validate uniqueness
    if (companyExistsBy) {
      throw new CustomError(
        "A company with this email already exists.",
        400,
        ERROR_CODES.RESOURCE_EXISTS
      );
    }

    // Create company
    const company = new Company({
      name,
      address,
      phone,
      email,
      subscriptionStatus: "pending",
      superAdmins: [],
      departments: [],
    });

    // Save company
    const savedCompany = await company.save();

    // Send response
    res.status(201).json(savedCompany);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

export { createCompany };
