import express from "express";
import tripsController from "../controllers/trips.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth, tripsController.createTrip);
router.route("/all").get(verifyAuth, tripsController.getAllTrips);
router.route("/:id").get(verifyAuth, tripsController.getTripById);
router.route("/dispatch/:id").patch(verifyAuth, tripsController.dispatchTrip);
router.route("/complete/:id").patch(verifyAuth, tripsController.completeTrip);
router.route("/cancel/:id").patch(verifyAuth, tripsController.cancelTrip);

export default router;
