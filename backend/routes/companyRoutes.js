import express from 'express';
import { createCompany } from '../controllers/companyController.js';
// import { protect, superAdminProtect } from '../middleware/authMiddleware.js'; // Will be added later for other routes

const router = express.Router();

// @route   POST /api/companies/register
// @desc    Register a new company
// @access  Public
router.post('/register', createCompany);

// Other company-related routes will be added here later, for example:
// router.get('/:id', protect, getCompanyById); // Need auth middleware
// router.put('/:id/update-status', protect, superAdminProtect, updateCompanySubscriptionStatus); // Need auth middleware

export default router;
