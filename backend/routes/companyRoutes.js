// backend/routes/companyRoutes.js
import express from "express";
import { createSubscription } from "../controllers/companyController.js"; // Updated import to createSubscription

const router = express.Router();

// @route   POST /api/companies/subscribe
// @desc    Handles company subscription: creates Company, initial Super Admin, and their specified Department.
// @access  Public
router.post("/subscribe", createSubscription); // Route uses createSubscription

// The route for /:companyId/setup-super-admin is now removed.

export default router;
