import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const createTrip = async ({ data }) => {
  try {
    const response = await api.post("/trips/create", {
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeightKg: data.cargoWeightKg,
      plannedDistanceKm: data.plannedDistanceKm,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllTrips = async ({ params } = {}) => {
  try {
    const response = await api.get("/trips/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTripById = async ({ id }) => {
  try {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const dispatchTrip = async ({ id }) => {
  try {
    const response = await api.patch(`/trips/dispatch/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const completeTrip = async ({ id, data }) => {
  try {
    const response = await api.patch(`/trips/complete/${id}`, {
      actualDistanceKm: data?.actualDistanceKm,
      endOdometerKm: data?.endOdometerKm,
      fuelConsumedLiters: data?.fuelConsumedLiters,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const cancelTrip = async ({ id }) => {
  try {
    const response = await api.patch(`/trips/cancel/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
