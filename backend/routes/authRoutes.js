// backend/routes/AuthRoutes.js
import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getRefreshToken,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validators/authValidator.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user and create a company
// @access  Public
router.post("/register", validateRegister, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post("/login", validateLogin, loginUser);

// @route   DELETE /api/auth/logout
// @desc    Logout user
// @access  Private
router.delete("/logout", verifyJWT, logoutUser);

// @route   GET /api/auth/refresh-token
// @desc    Refresh user token
// @access  Private
router.get("/refresh-token", verifyJWT, getRefreshToken);

export default router;
