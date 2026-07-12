import { api } from "./api";

const handleApiError = (error) => {
  if (error.response && error.response.data) {
   
    throw new Error(
      error.response.data.message || "An unexpected error occurred.",
    );
  }
  throw new Error(error.message || "Network error. Please try again.");
};


export const registerUser = async ({ data }) => {
  try {
    const response = await api.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const loginUser = async ({ data }) => {
  try {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
