// backend/controllers/companyController.js
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Company from "../models/CompanyModel.js";
import User from "../models/UserModel.js";
import Department from "../models/DepartmentModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

// @desc    Handles company subscription:
// @desc    creates Company, initial Super Admin,
// @desc    and their specified Department.
// @route   POST /api/companies/subscribe
// @access  Public
const createSubscription = asyncHandler(async (req, res, next) => {
  const { companyData, userData } = req.body;
  const { name, address, phone, email } = companyData || {};
  const {
    adminFirstName,
    adminLastName,
    adminEmail,
    adminPassword,
    adminPosition,
    departmentName,
  } = userData || {};

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Prepare company phone number
    let formattedPhone = phone;
    if (formattedPhone.startsWith("09")) {
      formattedPhone = phone.replace("09", "+2519");
    }

    const newCompany = new Company({
      name,
      address,
      phone: formattedPhone,
      email,
      superAdmins: [],
      departments: [],
    });
    const savedCompany = await newCompany.save({ session });

    // Create User-Specified Department
    const userDepartment = new Department({
      name: departmentName, // Use departmentName from userData
      description: `department of ${departmentName}`,
      company: savedCompany._id,
      members: [],
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

    // Link the new super admin to the new company
    savedCompany.superAdmins.push(savedSuperAdmin._id);

    // Link the new department to the new company
    savedCompany.departments.push(savedUserDepartment._id);

    // Save the updated company
    await savedCompany.save({ session });

    // Add super admin to department members
    savedUserDepartment.members.push(savedSuperAdmin._id);

    // Save the updated department
    await savedUserDepartment.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      message: "Company, Super Admin with his Department created successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export { createSubscription };
