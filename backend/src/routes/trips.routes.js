import express from "express";
import tripsController from "../controllers/trips.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth,authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"),  tripsController.createTrip);
router.route("/all").get(verifyAuth,authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"),  tripsController.getAllTrips);
router.route("/:id").get(verifyAuth,authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"),  tripsController.getTripById);
router.route("/dispatch/:id").patch(verifyAuth, authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"), tripsController.dispatchTrip);
router.route("/complete/:id").patch(verifyAuth, authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"), tripsController.completeTrip);
router.route("/cancel/:id").patch(verifyAuth, authorizeRoles("FLEET_MANAGER", "TRIP_DISPATCHER"), tripsController.cancelTrip);

export default router;
