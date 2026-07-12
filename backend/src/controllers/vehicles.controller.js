import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and, or, ilike } from "drizzle-orm";
import { db } from "../db/db.js";
import { vehiclesTable } from "../db/schema.js";


const  addVehicle= asyncHandler(async (req, res) => {
    const {
      registrationNumber,
      name,
      type,
      maxLoadCapacityKg,
      odometerKm,
      acquisitionCost,
      status,
    } = req.body;

    if (!registrationNumber || !name || !type || !acquisitionCost || !status || !maxLoadCapacityKg) {
      throw new ApiError(400, "Missing required fields");
    }

    const [existingVehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.registrationNumber, registrationNumber));

    if (existingVehicle) {
      throw new ApiError(400, "Vehicle with this registration number already exists");
    }

    const [newVehicle] = await db.insert(vehiclesTable).values({
      registrationNumber,
      name,
      type,
      maxLoadCapacityKg,
      odometerKm,
      acquisitionCost,
      status,
    }).returning();

    return res.status(201).json(new ApiResponse(201, newVehicle, "Vehicle added successfully"));

})


const getAllVehicles = asyncHandler(async (req, res) => {
  const { search, type, status } = req.query;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(vehiclesTable.registrationNumber, `%${search}%`),
        ilike(vehiclesTable.name, `%${search}%`),
      ),
    );
  }

  if (type) {
    conditions.push(eq(vehiclesTable.type, type));
  }

  if (status) {
    conditions.push(eq(vehiclesTable.status, status));
  }

 

  const vehicles = await db
    .select()
    .from(vehiclesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        vehicles,
        vehicles.length > 0
          ? "Vehicles retrieved successfully"
          : "No vehicles found",
      ),
    );
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id));

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));

    return res.status(200).json(new ApiResponse(200, null, "Vehicle deleted successfully"));
});

export default {
  addVehicle,
  getAllVehicles,
  deleteVehicle,
};

