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
    // Check for existing company with the same email, name, or phone
    let existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      throw new CustomError(
        `A company with email '${email}' already exists.`,
        409, // 409 Conflict is more appropriate here
        ERROR_CODES.RESOURCE_EXISTS
      );
    }

    existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      throw new CustomError(
        `A company with name '${name}' already exists.`,
        409,
        ERROR_CODES.RESOURCE_EXISTS
      );
    }

    existingCompany = await Company.findOne({ phone });
    if (existingCompany) {
      throw new CustomError(
        `A company with phone '${phone}' already exists.`,
        409,
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
