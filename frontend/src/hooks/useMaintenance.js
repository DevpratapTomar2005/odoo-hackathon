import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaintenanceLog,
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  closeMaintenanceLog,
} from "../services/api/maintenanceApi.js";
import toast from "react-hot-toast";

export const useMaintenanceLogs = (params = {}) => {
  return useQuery({
    queryKey: ["maintenanceLogs", params],
    queryFn: () => getAllMaintenanceLogs({ params }),
  });
};

export const useMaintenanceLog = (id) => {
  return useQuery({
    queryKey: ["maintenanceLogs", id],
    queryFn: () => getMaintenanceLogById({ id }),
    enabled: !!id,
  });
};

export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(
        response.message || "Maintenance log created successfully!",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create maintenance log.");
    },
  });
};

export const useCloseMaintenanceLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeMaintenanceLog,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(
        response.message || "Maintenance log closed successfully!",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close maintenance log.");
    },
  });
};
