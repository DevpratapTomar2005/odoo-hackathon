import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const createMaintenanceLog = async ({ data }) => {
  try {
    const response = await api.post("/maintenance/create", {
      vehicleId: data.vehicleId,
      serviceTyp: data.serviceTyp,
      cost: data.cost,
      serviceDate: data.serviceDate,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllMaintenanceLogs = async ({ params } = {}) => {
  try {
    const response = await api.get("/maintenance/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMaintenanceLogById = async ({ id }) => {
  try {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const closeMaintenanceLog = async ({ id, data }) => {
  try {
    const response = await api.patch(`/maintenance/close/${id}`, {
      cost: data?.cost,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
