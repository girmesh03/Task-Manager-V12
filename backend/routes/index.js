// refactor/code-polish-updates
import express from "express";

import companyRoutes from "./companyRoutes.js";
// import paymentRoutes from "./paymentRoutes.js"; // Removed payment routes
// import userRoutes from "./userRoutes.js"; // Removed user routes
// import departmentRoutes from "./departmentRoutes.js"; // Removed department routes

const router = express.Router();

router.use("/companies", companyRoutes);
// router.use("/payments", paymentRoutes); // Removed payment routes
// router.use("/users", userRoutes); // Removed user routes
// router.use("/departments", departmentRoutes); // Removed department routes

export default router;
