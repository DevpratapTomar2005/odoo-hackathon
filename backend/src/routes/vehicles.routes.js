import express from "express";
import vehicleControllers from "../controllers/vehicles.controller.js";
import {verifyAuth} from "../middlewares/verifyAuth.middleware.js";
import {authorizeRoles} from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.post("/create", verifyAuth, vehicleControllers.addVehicle);
router.get("/all", verifyAuth, vehicleControllers.getAllVehicles);
router.delete("/delete/:id", verifyAuth, vehicleControllers.deleteVehicle);

export default router;