import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { eq, and, or, ilike } from "drizzle-orm";
import { db } from "../db/db.js";
import { tripsTable, vehiclesTable, driversTable } from "../db/schema.js";

const createTrip = asyncHandler(async (req, res) => {
  const {
    source,
    destination,
    vehicleId,
    driverId,
    cargoWeightKg,
    plannedDistanceKm,
  } = req.body;

  if (
    !source ||
    !destination ||
    !vehicleId ||
    !driverId ||
    cargoWeightKg === undefined ||
    cargoWeightKg === null ||
    !plannedDistanceKm
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, vehicleId));

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (vehicle.status !== "available") {
    throw new ApiError(
      400,
      `Vehicle is not available (current status: ${vehicle.status})`,
    );
  }

  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, driverId));

  if (!driver) {
    throw new ApiError(404, "Driver not found");
  }

  if (driver.status !== "available") {
    throw new ApiError(
      400,
      `Driver is not available (current status: ${driver.status})`,
    );
  }

  if (driver.status === "suspended") {
    throw new ApiError(
      400,
      "Driver is suspended and cannot be assigned to trips",
    );
  }

  const today = new Date();
  const licenseExpiry = new Date(driver.licenseExpiryDate);
  if (licenseExpiry < today) {
    throw new ApiError(
      400,
      "Driver's license has expired and cannot be assigned to trips",
    );
  }

  if (Number(cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
    throw new ApiError(
      400,
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacityKg}kg)`,
    );
  }

  const [newTrip] = await db
    .insert(tripsTable)
    .values({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeightKg,
      plannedDistanceKm,
      status: "draft",
      createdBy: req.user?.id,
    })
    .returning();

  return res
    .status(201)
    .json(new ApiResponse(201, newTrip, "Trip created successfully"));
});

const dispatchTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.id, id));

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  if (trip.status !== "draft") {
    throw new ApiError(
      400,
      `Only draft trips can be dispatched (current status: ${trip.status})`,
    );
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, trip.vehicleId));

  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, trip.driverId));

  if (!vehicle || vehicle.status !== "available") {
    throw new ApiError(400, "Vehicle is no longer available for dispatch");
  }

  if (!driver || driver.status !== "available") {
    throw new ApiError(400, "Driver is no longer available for dispatch");
  }

  const updatedTrip = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tripsTable)
      .set({
        status: "dispatched",
        dispatchedAt: new Date(),
        startOdometerKm: vehicle.odometerKm,
      })
      .where(eq(tripsTable.id, id))
      .returning();

    await tx
      .update(vehiclesTable)
      .set({ status: "on_trip" })
      .where(eq(vehiclesTable.id, trip.vehicleId));

    await tx
      .update(driversTable)
      .set({ status: "on_trip" })
      .where(eq(driversTable.id, trip.driverId));

    return updated;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTrip, "Trip dispatched successfully"));
});

const completeTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actualDistanceKm, endOdometerKm, fuelConsumedLiters } = req.body;

  if (!endOdometerKm) {
    throw new ApiError(
      400,
      "Final odometer reading is required to complete a trip",
    );
  }

  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.id, id));

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  if (trip.status !== "dispatched") {
    throw new ApiError(
      400,
      `Only dispatched trips can be completed (current status: ${trip.status})`,
    );
  }

  const updatedTrip = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tripsTable)
      .set({
        status: "completed",
        completedAt: new Date(),
        actualDistanceKm: actualDistanceKm ?? trip.plannedDistanceKm,
        endOdometerKm,
        fuelConsumedLiters,
      })
      .where(eq(tripsTable.id, id))
      .returning();

    await tx
      .update(vehiclesTable)
      .set({ status: "available", odometerKm: endOdometerKm })
      .where(eq(vehiclesTable.id, trip.vehicleId));

    await tx
      .update(driversTable)
      .set({ status: "available" })
      .where(eq(driversTable.id, trip.driverId));

    return updated;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTrip, "Trip completed successfully"));
});

const cancelTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.id, id));

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  if (trip.status === "completed" || trip.status === "cancelled") {
    throw new ApiError(
      400,
      `Trip is already ${trip.status} and cannot be cancelled`,
    );
  }

  const wasDispatched = trip.status === "dispatched";

  const updatedTrip = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tripsTable)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(tripsTable.id, id))
      .returning();

    
    if (wasDispatched) {
      await tx
        .update(vehiclesTable)
        .set({ status: "available" })
        .where(eq(vehiclesTable.id, trip.vehicleId));

      await tx
        .update(driversTable)
        .set({ status: "available" })
        .where(eq(driversTable.id, trip.driverId));
    }

    return updated;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTrip, "Trip cancelled successfully"));
});

const getAllTrips = asyncHandler(async (req, res) => {
  const { search, status, vehicleId, driverId } = req.query;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(tripsTable.source, `%${search}%`),
        ilike(tripsTable.destination, `%${search}%`),
      ),
    );
  }

  if (status) {
    conditions.push(eq(tripsTable.status, status));
  }

  if (vehicleId) {
    conditions.push(eq(tripsTable.vehicleId, vehicleId));
  }

  if (driverId) {
    conditions.push(eq(tripsTable.driverId, driverId));
  }

  const trips = await db
    .select()
    .from(tripsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        trips,
        trips.length > 0 ? "Trips retrieved successfully" : "No trips found",
      ),
    );
});

const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.id, id));

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, trip, "Trip retrieved successfully"));
});

export default {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getAllTrips,
  getTripById,
};
