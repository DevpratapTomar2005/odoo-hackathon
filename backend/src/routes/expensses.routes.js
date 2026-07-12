import express from "express";
import expensesController from "../controllers/expensses.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

router
  .route("/create")
  .post(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    expensesController.addExpense,
  );
router
  .route("/all")
  .get(
    verifyAuth,
    authorizeRoles("FLEET_MANAGER", "FINANACIAL_OFFICER"),
    expensesController.getAllExpenses,
  );

export default router;
