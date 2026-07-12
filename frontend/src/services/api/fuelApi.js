import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const addFuelLog = async ({ data }) => {
  try {
    const response = await api.post("/fuel/create", {
      vehicleId: data.vehicleId,
      tripId: data.tripId,
      liters: data.liters,
      cost: data.cost,
      date: data.date,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllFuelLogs = async ({ params } = {}) => {
  try {
    const response = await api.get("/fuel/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllVehiclesOperationalCost = async () => {
  try {
    const response = await api.get("/fuel/operational-cost/all");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getVehicleOperationalCost = async ({ vehicleId }) => {
  try {
    const response = await api.get(`/fuel/operational-cost/${vehicleId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
