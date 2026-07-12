import express from "express";
import vehicleControllers from "../controllers/vehicles.controller.js";
import {verifyAuth} from "../middlewares/verifyAuth.middleware.js";
import {authorizeRoles} from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.post("/create", verifyAuth, authorizeRoles("FLEET_MANAGER"), vehicleControllers.addVehicle);
router.get("/all", verifyAuth, authorizeRoles("FLEET_MANAGER"),  vehicleControllers.getAllVehicles);
router.delete("/delete/:id", verifyAuth, authorizeRoles("FLEET_MANAGER"), vehicleControllers.deleteVehicle);

export default router;