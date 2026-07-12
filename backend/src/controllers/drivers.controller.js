import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { driversTable } from "../db/schema.js";

const addDriver = asyncHandler(async (req, res) => {
  const {
    userId,
    name,
    licenseNumber,
    licenseCategory,
    licenseExpiryDate,
    contactNumber,
    status,
  } = req.body;

  if (
    !userId ||
    !name ||
    !licenseNumber ||
    !licenseCategory ||
    !licenseExpiryDate ||
    !contactNumber
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const [existingDriver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.licenseNumber, licenseNumber));

  if (existingDriver) {
    throw new ApiError(400, "Driver with this license number already exists");
  }

  const [newDriver] = await db
    .insert(driversTable)
    .values({
      userId,
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      status: status || "available",
    })
    .returning();

  return res
    .status(201)
    .json(new ApiResponse(201, newDriver, "Driver added successfully"));
});

const getAllDrivers = asyncHandler(async (req, res) => {
  const { search, status, licenseCategory } = req.query;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(driversTable.name, `%${search}%`),
        ilike(driversTable.licenseNumber, `%${search}%`),
      ),
    );
  }

  if (status) {
    conditions.push(eq(driversTable.status, status));
  }

  if (licenseCategory) {
    conditions.push(eq(driversTable.licenseCategory, licenseCategory));
  }

  const drivers = await db
    .select()
    .from(driversTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        drivers,
        drivers.length > 0
          ? "Drivers retrieved successfully"
          : "No drivers found",
      ),
    );
});

const deleteDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, id));

  if (!driver) {
    throw new ApiError(404, "Driver not found");
  }

  await db.delete(driversTable).where(eq(driversTable.id, id));

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Driver deleted successfully"));
});

export default {
  addDriver,
  getAllDrivers,
  deleteDriver
};
