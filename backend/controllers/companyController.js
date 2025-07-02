// backend/controllers/companyController.js
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Company from "../models/CompanyModel.js";
import User from "../models/UserModel.js"; // Added import
import Department from "../models/DepartmentModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

// @desc    Handles company subscription: creates Company, initial Super Admin, and their specified Department.
// @route   POST /api/companies/subscribe
// @access  Public
const createSubscription = asyncHandler(async (req, res, next) => {
  // Expecting structure: { companyData: {name, address, ...}, userData: {firstName, ..., departmentName} }
  // Expecting structure: { companyData: {name, address, ...}, userData: {firstName, ..., departmentName} }
  const { companyData, userData } = req.body;

  // Explicit initial validation removed, relying on Mongoose schema validation.
  // Ensure req.body structure is as expected, or Mongoose validation might not trigger on nested fields if parent object is missing.
  // For instance, if userData is undefined, userData.adminEmail will throw a TypeError before Mongoose validation.
  // A minimal check for parent objects might still be prudent or ensure robust frontend data submission.
  // For now, proceeding with full reliance on Mongoose for field content.

  // Extracting for easier use, matching previous direct destructuring style for the core logic
  const { name, address, phone, email } = companyData || {};
  const {
    adminFirstName, adminLastName, adminEmail, adminPassword,
    adminPosition, departmentName
  } = userData || {}; // Add default empty object to prevent TypeError if userData is missing


  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Company Uniqueness Checks
    let existingCompany = await Company.findOne({ $or: [{ email }, { name }, { phone }] }).session(session);
    if (existingCompany) {
      let conflictField = "detail";
      if (existingCompany.email === email) conflictField = "email";
      else if (existingCompany.name === name) conflictField = "name";
      else if (existingCompany.phone === phone) conflictField = "phone";
      throw new CustomError(`A company with this ${conflictField} already exists.`, 409, ERROR_CODES.RESOURCE_EXISTS);
    }

    // User Email Uniqueness Check
    const existingUser = await User.findOne({ email: adminEmail }).session(session);
    if (existingUser) {
      throw new CustomError(`A user with email '${adminEmail}' already exists.`, 409, ERROR_CODES.RESOURCE_EXISTS);
    }

    // Create Company
    const newCompany = new Company({
      name,
      address,
      phone,
      email,
      // subscriptionStatus is removed, company is active by default
      superAdmins: [],
      departments: [],
    });
    const savedCompany = await newCompany.save({ session });

    // Create User-Specified Department
    const userDepartment = new Department({
      name: departmentName, // Use departmentName from userData
      description: `Main department for ${savedCompany.name} - ${departmentName}`, // Default description
      company: savedCompany._id,
      members: [],
      managers: [],
    });
    const savedUserDepartment = await userDepartment.save({ session });

    // Create Initial Super Admin User
    const superAdmin = new User({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword, // Hashed by pre-save hook
      position: adminPosition,
      role: "SuperAdmin",
      department: savedUserDepartment._id, // Link to the user-specified department
      isVerified: true, // Auto-verified for initial setup
      isActive: true,
    });
    const savedSuperAdmin = await superAdmin.save({ session });

    // Link Entities
    savedCompany.superAdmins.push(savedSuperAdmin._id);
    savedCompany.departments.push(savedUserDepartment._id); // Link company to the new department
    await savedCompany.save({ session });

    savedUserDepartment.members.push(savedSuperAdmin._id); // Add admin to department members
    savedUserDepartment.managers.push(savedSuperAdmin._id); // Add admin to department managers
    await savedUserDepartment.save({ session });

    await session.commitTransaction();

    const adminResponse = savedSuperAdmin.toObject();
    delete adminResponse.password;

    // Populate fields for the response
    const populatedCompany = await Company.findById(savedCompany._id)
      .populate({
        path: 'superAdmins',
        select: '-password', // Exclude password from populated admin
        populate: { path: 'department', model: 'Department'} // Populate department of superAdmin
      })
      .populate('departments')
      .session(session); // Use session for populate if it's part of the transaction read consistency
      // Though, after commit, session might not be strictly necessary for read, but good for consistency if before commit.
      // For simplicity here, assuming commit has happened or is about to, and reads are for the response.

    const populatedSuperAdmin = await User.findById(savedSuperAdmin._id)
      .populate('department')
      .select('-password')
      .session(session);


    res.status(201).json({
      message: "Company, Super Admin, and initial Department created successfully.",
      company: populatedCompany.toObject(), // Send populated company
      superAdmin: populatedSuperAdmin.toObject(), // Send populated admin
      department: savedUserDepartment.toObject(), // Initial department details
    });

  } catch (error) {
    await session.abortTransaction();
    // Pass mongoose validation errors directly to global error handler
    if (error.name === 'ValidationError' || error instanceof CustomError) {
      next(error);
    } else {
      // For other unexpected errors
      console.error("Create Subscription Error:", error);
      next(new CustomError(error.message || "Failed to create subscription.", 500, ERROR_CODES.OPERATION_FAILED));
    }
  } finally {
    session.endSession();
  }
});

export { createSubscription };
