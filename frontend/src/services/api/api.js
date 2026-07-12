import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../tokenManager.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

    
        const newAccessToken = response.data.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
