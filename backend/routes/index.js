// backend/routes/index.js
import express from "express";

import companyRoutes from "./companyRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

router.use("/companies", companyRoutes);
router.use("/auth", authRoutes);

export default router;
