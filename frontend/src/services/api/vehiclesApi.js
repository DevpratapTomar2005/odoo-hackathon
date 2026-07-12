import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const addVehicle = async ({ data }) => {
  try {
    const response = await api.post("/vehicles/create", {
      registrationNumber: data.registrationNumber,
      name: data.name,
      type: data.type,
      maxLoadCapacityKg: data.maxLoadCapacityKg,
      odometerKm: data.odometerKm,
      acquisitionCost: data.acquisitionCost,
      status: data.status,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllVehicles = async ({ params } = {}) => {
  try {
    const response = await api.get("/vehicles/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteVehicle = async ({ id }) => {
  try {
    const response = await api.delete(`/vehicles/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
