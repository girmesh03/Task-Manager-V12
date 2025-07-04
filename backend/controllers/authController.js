// backend/controllers/AuthController.js
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .populate("department", "name")
      .select("+password");

    // Authentication checks
    if (!user)
      return next(
        new CustomError(
          "Invalid credentials",
          401,
          ERROR_CODES.INVALID_CREDENTIALS
        )
      );
    if (!(await user.matchPassword(password))) {
      return next(
        new CustomError(
          "Invalid credentials",
          401,
          ERROR_CODES.INVALID_CREDENTIALS
        )
      );
    }
    if (!user.isVerified) {
      return next(
        new CustomError(
          "Please verify your email first",
          403,
          ERROR_CODES.ACCOUNT_NOT_VERIFIED
        )
      );
    }
    if (!user.isActive) {
      return next(
        new CustomError(
          "Account deactivated - contact administrator",
          403,
          ERROR_CODES.ACCOUNT_INACTIVE
        )
      );
    }

    // Generate tokens
    generateAccessToken(res, user);
    await generateRefreshToken(res, user);

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    // Send response
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user
// @route   DELETE /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Refresh user token
// @route   GET /api/auth/refresh-token
// @access  Private
const getRefreshToken = asyncHandler(async (req, res, next) => {
  const currentRefreshToken = req.cookies?.refresh_token;

  if (!currentRefreshToken) {
    return next(
      new CustomError(
        "No refresh token provided",
        401,
        ERROR_CODES.UNAUTHORIZED_ACCESS
      )
    );
  }

  const user = await User.findOne({ refreshToken: currentRefreshToken }).select(
    "+refreshToken"
  );

  if (!user) {
    // Clear potentially compromised cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return next(
      new CustomError(
        "Invalid refresh token. Please log in again.",
        403,
        ERROR_CODES.INVALID_TOKEN
      )
    );
  }

  // Verify token
  try {
    jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
    return next(
      new CustomError("Invalid refresh token", 403, ERROR_CODES.INVALID_TOKEN)
    );
  }

  // Check account status
  if (!user.isActive) {
    return next(
      new CustomError("Account not active", 403, ERROR_CODES.ACCOUNT_INACTIVE)
    );
  }

  // Check if the user is verified
  if (!user.isVerified) {
    return next(
      new CustomError(
        "Account not verified",
        403,
        ERROR_CODES.ACCOUNT_NOT_VERIFIED
      )
    );
  }

  // Generate new tokens
  generateAccessToken(res, user);
  await generateRefreshToken(res, user);

  res.status(200).json({
    message: "Token refreshed successfully",
  });
});

export { loginUser, logoutUser, getRefreshToken };
