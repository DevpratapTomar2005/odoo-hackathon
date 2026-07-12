import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  fuelLogsTable,
  maintenanceLogsTable,
  vehiclesTable,
} from "../db/schema.js";

const addFuelLog = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, liters, cost, date } = req.body;

  if (!vehicleId || !liters || !cost || !date) {
    throw new ApiError(400, "Missing required fields");
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const [newFuelLog] = await db
    .insert(fuelLogsTable)
    .values({
      vehicleId,
      tripId: tripId || null,
      liters,
      cost,
      date,
      createdBy: req.user?.id,
    })
    .returning();

  return res
    .status(201)
    .json(new ApiResponse(201, newFuelLog, "Fuel log recorded successfully"));
});

const getAllFuelLogs = asyncHandler(async (req, res) => {
  const { vehicleId, tripId } = req.query;

  const conditions = [];

  if (vehicleId) {
    conditions.push(eq(fuelLogsTable.vehicleId, vehicleId));
  }

  if (tripId) {
    conditions.push(eq(fuelLogsTable.tripId, tripId));
  }

  const logs = await db
    .select()
    .from(fuelLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        logs,
        logs.length > 0
          ? "Fuel logs retrieved successfully"
          : "No fuel logs found",
      ),
    );
});

const getVehicleOperationalCost = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const [{ totalFuelCost }] = await db
    .select({
      totalFuelCost: sql`coalesce(sum(${fuelLogsTable.cost}), 0)`.mapWith(
        Number,
      ),
    })
    .from(fuelLogsTable)
    .where(eq(fuelLogsTable.vehicleId, vehicleId));

  const [{ totalMaintenanceCost }] = await db
    .select({
      totalMaintenanceCost:
        sql`coalesce(sum(${maintenanceLogsTable.cost}), 0)`.mapWith(Number),
    })
    .from(maintenanceLogsTable)
    .where(eq(maintenanceLogsTable.vehicleId, vehicleId));

  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vehicleId,
        totalFuelCost,
        totalMaintenanceCost,
        totalOperationalCost,
      },
      "Operational cost calculated successfully",
    ),
  );
});

const getAllVehiclesOperationalCost = asyncHandler(async (req, res) => {
  const fuelTotals = await db
    .select({
      vehicleId: fuelLogsTable.vehicleId,
      totalFuelCost: sql`coalesce(sum(${fuelLogsTable.cost}), 0)`.mapWith(
        Number,
      ),
    })
    .from(fuelLogsTable)
    .groupBy(fuelLogsTable.vehicleId);

  const maintenanceTotals = await db
    .select({
      vehicleId: maintenanceLogsTable.vehicleId,
      totalMaintenanceCost:
        sql`coalesce(sum(${maintenanceLogsTable.cost}), 0)`.mapWith(Number),
    })
    .from(maintenanceLogsTable)
    .groupBy(maintenanceLogsTable.vehicleId);

  const vehicles = await db.select().from(vehiclesTable);

  const fuelMap = new Map(
    fuelTotals.map((f) => [f.vehicleId, f.totalFuelCost]),
  );
  const maintenanceMap = new Map(
    maintenanceTotals.map((m) => [m.vehicleId, m.totalMaintenanceCost]),
  );

  const result = vehicles.map((vehicle) => {
    const totalFuelCost = fuelMap.get(vehicle.id) || 0;
    const totalMaintenanceCost = maintenanceMap.get(vehicle.id) || 0;

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost: totalFuelCost + totalMaintenanceCost,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Operational costs calculated successfully"),
    );
});

export default {
  addFuelLog,
  getAllFuelLogs,
  getVehicleOperationalCost,
  getAllVehiclesOperationalCost,
};
