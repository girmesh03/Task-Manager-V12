// backend/routes/companyRoutes.js
import express from "express";
import { createSubscription } from "../controllers/companyController.js";
import { validateSubscription } from "../middlewares/validators/companyValidator.js";

const router = express.Router();

// @route   POST /api/companies/subscribe
// @desc    Handles company subscription:
// @desc    creates Company, initial Super Admin, and their specified Department.
// @access  Public
router.post("/subscribe", validateSubscription, createSubscription);

export default router;
