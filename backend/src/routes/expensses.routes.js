import express from "express";
import expensesController from "../controllers/expensses.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router.route("/create").post(verifyAuth, expensesController.addExpense);
router.route("/all").get(verifyAuth, expensesController.getAllExpenses);

export default router;
