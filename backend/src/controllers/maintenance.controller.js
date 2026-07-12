import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and, ilike } from "drizzle-orm";
import { db } from "../db/db.js";
import { maintenanceLogsTable, vehiclesTable } from "../db/schema.js";


const createMaintenanceLog = asyncHandler(async (req, res) => {
  const { vehicleId, serviceTyp, cost, serviceDate } = req.body;

  if (!vehicleId || !serviceTyp || !serviceDate) {
    throw new ApiError(400, "Missing required fields");
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (vehicle.status === "on_trip") {
    throw new ApiError(
      400,
      "Vehicle is currently on a trip and cannot be sent for maintenance",
    );
  }

  if (vehicle.status === "retired") {
    throw new ApiError(
      400,
      "Vehicle is retired and cannot be added to maintenance",
    );
  }

  if (vehicle.status === "in_shop") {
    throw new ApiError(400, "Vehicle already has an active maintenance record");
  }

  const newLog = await db.transaction(async (tx) => {
    const [log] = await tx
      .insert(maintenanceLogsTable)
      .values({
        vehicleId,
        serviceTyp,
        cost: cost ?? 0,
        serviceDate,
        status: "active",
        createdBy: req.user?.id,
      })
      .returning();

    await tx
      .update(vehiclesTable)
      .set({ status: "in_shop" })
      .where(eq(vehiclesTable.id, vehicleId));

    return log;
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLog, "Maintenance log created successfully"));
});



const closeMaintenanceLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cost } = req.body; 

  const [log] = await db
    .select()
    .from(maintenanceLogsTable)
    .where(eq(maintenanceLogsTable.id, id));

  if (!log) {
    throw new ApiError(404, "Maintenance log not found");
  }

  if (log.status !== "active") {
    throw new ApiError(400, "Maintenance log is already closed");
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, log.vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Associated vehicle not found");
  }

  const updatedLog = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(maintenanceLogsTable)
      .set({
        status: "completed",
        ...(cost !== undefined && { cost }),
      })
      .where(eq(maintenanceLogsTable.id, id))
      .returning();

    
    if (vehicle.status !== "retired") {
      await tx
        .update(vehiclesTable)
        .set({ status: "available" })
        .where(eq(vehiclesTable.id, log.vehicleId));
    }

    return updated;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedLog, "Maintenance log closed successfully"),
    );
});



const getAllMaintenanceLogs = asyncHandler(async (req, res) => {
  const { search, status, vehicleId } = req.query;

  const conditions = [];

  if (search) {
    conditions.push(ilike(maintenanceLogsTable.serviceTyp, `%${search}%`));
  }

  if (status) {
    conditions.push(eq(maintenanceLogsTable.status, status));
  }

  if (vehicleId) {
    conditions.push(eq(maintenanceLogsTable.vehicleId, vehicleId));
  }

  const logs = await db
    .select()
    .from(maintenanceLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        logs,
        logs.length > 0
          ? "Maintenance logs retrieved successfully"
          : "No maintenance logs found",
      ),
    );
});


const getMaintenanceLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [log] = await db
    .select()
    .from(maintenanceLogsTable)
    .where(eq(maintenanceLogsTable.id, id));

  if (!log) {
    throw new ApiError(404, "Maintenance log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Maintenance log retrieved successfully"));
});

export default {
  createMaintenanceLog,
  closeMaintenanceLog,
  getAllMaintenanceLogs,
  getMaintenanceLogById,
};
