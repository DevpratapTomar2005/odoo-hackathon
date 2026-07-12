import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and } from "drizzle-orm";
import { db } from "../db/db.js";
import { expensesTable, vehiclesTable } from "../db/schema.js";

const addExpense = asyncHandler(async (req, res) => {
  const { vehicleId, type, amount, date } = req.body;

  if (!vehicleId || !type || !amount || !date) {
    throw new ApiError(400, "Missing required fields");
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const [newExpense] = await db
    .insert(expensesTable)
    .values({
      vehicleId,
      type,
      amount,
      date,
      createdBy: req.user?.id,
    })
    .returning();

  return res
    .status(201)
    .json(new ApiResponse(201, newExpense, "Expense recorded successfully"));
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const { vehicleId, type } = req.query;

  const conditions = [];

  if (vehicleId) {
    conditions.push(eq(expensesTable.vehicleId, vehicleId));
  }

  if (type) {
    conditions.push(eq(expensesTable.type, type));
  }

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        expenses,
        expenses.length > 0
          ? "Expenses retrieved successfully"
          : "No expenses found",
      ),
    );
});

export default {
  addExpense,
  getAllExpenses,
};
