import express from "express";
import authControllers from "../controllers/auth.controller.js";
import {verifyAuth} from "../middlewares/verifyAuth.middleware.js";

const router = express.Router();

router.route("/register").post(authControllers.registerUser);
router.route("/login").post(authControllers.loginUser);
router.route("/refresh-token").post(authControllers.refreshToken);
router.route("/logout").post(authControllers.logoutUser);
router.route("/users").get(verifyAuth, authControllers.getUsersByRole);

export default router;