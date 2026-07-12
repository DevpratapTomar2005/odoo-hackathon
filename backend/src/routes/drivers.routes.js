import express from "express";
import driversController from "../controllers/drivers.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.addDriver);
router.route("/all").get(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.getAllDrivers);
router.route('/delete/:id').delete(verifyAuth,authorizeRoles("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.deleteDriver)

export default router;
