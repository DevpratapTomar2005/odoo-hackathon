import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const getUsersByRole = async ({ role }) => {
  try {
    const response = await api.get("/auth/users", { params: { role } });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const addDriver = async ({ data }) => {
  try {
    const response = await api.post("/drivers/create", {
      userId: data.userId,
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseCategory: data.licenseCategory,
      licenseExpiryDate: data.licenseExpiryDate,
      contactNumber: data.contactNumber,
      status: data.status,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllDrivers = async ({ params } = {}) => {
  try {
    const response = await api.get("/drivers/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteDriver = async ({ id }) => {
  try {
    const response = await api.delete(`/drivers/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
