import express from "express";
import maintenanceController from "../controllers/maintenance.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router
  .route("/create")
  .post(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.createMaintenanceLog);

router
  .route("/all")
  .get(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.getAllMaintenanceLogs);

router
  .route("/:id")
  .get(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.getMaintenanceLogById);

router
  .route("/close/:id")
  .patch(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), maintenanceController.closeMaintenanceLog);
  

export default router;
