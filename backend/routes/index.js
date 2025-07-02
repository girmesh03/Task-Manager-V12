// backend/routes/index.js
import express from "express";

import companyRoutes from "./companyRoutes.js";

const router = express.Router();

router.use("/companies", companyRoutes);

export default router;
