import express from "express";
import driversController from "../controllers/drivers.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth, driversController.addDriver);
router.route("/all").get(verifyAuth, driversController.getAllDrivers);
router.route('/delete/:id').delete(verifyAuth, driversController.deleteDriver)

export default router;
