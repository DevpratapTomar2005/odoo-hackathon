import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};

export const addExpense = async ({ data }) => {
  try {
    const response = await api.post("/expenses/create", {
      vehicleId: data.vehicleId,
      type: data.type,
      amount: data.amount,
      date: data.date,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllExpenses = async ({ params } = {}) => {
  try {
    const response = await api.get("/expenses/all", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
