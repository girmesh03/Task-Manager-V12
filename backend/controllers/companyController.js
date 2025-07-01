import asyncHandler from 'express-async-handler';
import Company from '../models/CompanyModel.js';
import CustomError from '../errorHandler/CustomError.js';

// Error Code Constants (can be moved to a shared constants file later)
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  OPERATION_FAILED: 'OPERATION_FAILED',
  // Add more generic codes as needed
};

// @desc    Register a new company (initial step of subscription)
// @route   POST /api/companies/register
// @access  Public
const createCompany = asyncHandler(async (req, res) => {
  const { name, address, phone, email } = req.body;

  // Basic validation for required fields
  if (!name || !address || !phone || !email) {
    throw new CustomError(
      'Please provide all required company details: name, address, phone, and email.',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Check if company with the same email already exists
  const companyExistsByEmail = await Company.findOne({ email });
  if (companyExistsByEmail) {
    throw new CustomError(
      'A company with this email already exists.',
      400,
      ERROR_CODES.RESOURCE_EXISTS // Frontend can check message or specific field in a structured error response if needed
    );
  }

  // Check if company with the same name already exists
  const companyExistsByName = await Company.findOne({ name });
  if (companyExistsByName) {
    throw new CustomError(
      'A company with this name already exists.',
      400,
      ERROR_CODES.RESOURCE_EXISTS
    );
  }

  // Create company
  const company = await Company.create({
    name,
    address,
    phone,
    email,
    subscriptionStatus: 'pending', // Default status as per requirements
  });

  if (company) {
    res.status(201).json({
      // It's good practice to return the created resource,
      // selectively choosing which fields to send back.
      _id: company._id,
      name: company.name,
      email: company.email,
      address: company.address,
      phone: company.phone,
      subscriptionStatus: company.subscriptionStatus,
      message: 'Company registration initiated. Please proceed with payment simulation to activate and create SuperAdmin account.',
    });
  } else {
    // This case is less likely if Mongoose validations are robust
    // but serves as a fallback.
    throw new CustomError(
      'Invalid company data. Company could not be created.',
      500, // Internal Server Error for unexpected failure
      ERROR_CODES.OPERATION_FAILED
    );
  }
});

export { createCompany };
