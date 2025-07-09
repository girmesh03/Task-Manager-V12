// backend/middlewares/authMiddleware.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(
      new CustomError(
        "Authorization access token required",
        401,
        ERROR_CODES.UNAUTHORIZED_ACCESS
      )
    );
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
    if (err) {
      return next(
        new CustomError(`${err.message}`, 401, ERROR_CODES.INVALID_TOKEN)
      );
    }

    try {
      // Get user from database
      const user = await User.findById(decoded._id)
        .select("+isVerified")
        .populate("department", "_id");

      // Check if user exists
      if (!user) {
        return next(
          new CustomError(
            "User account not found",
            404,
            ERROR_CODES.RESOURCE_NOT_FOUND
          )
        );
      }

      // Check if user is verified
      if (!user.isVerified) {
        return next(
          new CustomError(
            "Account not verified",
            403,
            ERROR_CODES.ACCOUNT_NOT_VERIFIED
          )
        );
      }

      // Add user to request
      req.user = {
        _id: user._id,
        role: user.role,
        department: user.department._id,
      };

      next();
    } catch (error) {
      next(error);
    }
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          "Insufficient permissions for this action",
          403,
          ERROR_CODES.UNAUTHORIZED_ACCESS
        )
      );
    }
    next();
  };
};

export const verifyDepartmentAccess = async (req, res, next) => {
  const { departmentId } = req.params;

  try {
    // SuperAdmin bypass
    if (req.user.role === "SuperAdmin") return next();

    // Check if user belongs to the department
    const department = await mongoose
      .model("Department")
      .exists({ _id: departmentId });
    if (!department)
      throw new CustomError(
        "Department not found",
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );

    if (!req.user.department.equals(departmentId)) {
      throw new CustomError(
        "Department access denied",
        403,
        ERROR_CODES.UNAUTHORIZED_ACCESS
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
