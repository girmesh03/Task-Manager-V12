// backend/routes/companyRoutes.js
import express from "express";
import { createCompany } from "../controllers/companyController.js";

const router = express.Router();

// @route   POST /api/companies/register
// @desc    Register a new company
// @access  Public
router.post("/register", createCompany);

export default router;
