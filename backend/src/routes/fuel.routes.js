import express from "express";
import fuelController from "../controllers/fuel.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router
  .route("/create")
  .post(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    fuelController.addFuelLog,
  );
router
  .route("/all")
  .get(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    fuelController.getAllFuelLogs,
  );
router
  .route("/operational-cost/all")
  .get(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    fuelController.getAllVehiclesOperationalCost,
  );
router
  .route("/operational-cost/:vehicleId")
  .get(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    fuelController.getVehicleOperationalCost,
  );

export default router;
