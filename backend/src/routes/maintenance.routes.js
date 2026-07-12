import express from "express";
import maintenanceController from "../controllers/maintenance.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router
  .route("/create")
  .post(verifyAuth, maintenanceController.createMaintenanceLog);

router
  .route("/all")
  .get(verifyAuth, maintenanceController.getAllMaintenanceLogs);

router
  .route("/:id")
  .get(verifyAuth, maintenanceController.getMaintenanceLogById);

router
  .route("/close/:id")
  .patch(verifyAuth, maintenanceController.closeMaintenanceLog);
  

export default router;
