import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVehicle,
  getAllVehicles,
  deleteVehicle,
} from "../services/api/vehiclesApi.js";
import toast from "react-hot-toast";

export const useVehicles = (params = {}) => {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => getAllVehicles({ params }),
  });
};

export const useAddVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addVehicle,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message || "Vehicle added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add vehicle.");
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message || "Vehicle deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete vehicle.");
    },
  });
};
