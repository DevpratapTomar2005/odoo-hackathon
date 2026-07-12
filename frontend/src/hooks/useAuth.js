import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, registerUser, logoutUser } from "../services/api/authApi.js";
import toast from "react-hot-toast";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      queryClient.setQueryData(["authUser"], response.data.user);
      toast.success(response.message || "Logged in successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed.");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      queryClient.setQueryData(["authUser"], response.data.user);
      toast.success(response.message || "Account created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed.");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (response) => {
      queryClient.setQueryData(["authUser"], null);
      toast.success(response.message || "Logged out successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed.");
    },
  });
};
