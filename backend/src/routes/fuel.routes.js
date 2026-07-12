import express from "express";
import fuelController from "../controllers/fuel.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth, fuelController.addFuelLog);
router.route("/all").get(verifyAuth, fuelController.getAllFuelLogs);
router
  .route("/operational-cost/all")
  .get(verifyAuth, fuelController.getAllVehiclesOperationalCost);
router
  .route("/operational-cost/:vehicleId")
  .get(verifyAuth, fuelController.getVehicleOperationalCost);

export default router;
