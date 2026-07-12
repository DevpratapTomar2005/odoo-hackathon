import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFuelLog,
  getAllFuelLogs,
  getAllVehiclesOperationalCost,
  getVehicleOperationalCost,
} from "../services/api/fuelApi.js";
import toast from "react-hot-toast";

export const useFuelLogs = (params = {}) => {
  return useQuery({
    queryKey: ["fuelLogs", params],
    queryFn: () => getAllFuelLogs({ params }),
  });
};

export const useAllVehiclesOperationalCost = () => {
  return useQuery({
    queryKey: ["operationalCost", "all"],
    queryFn: getAllVehiclesOperationalCost,
  });
};

export const useVehicleOperationalCost = (vehicleId) => {
  return useQuery({
    queryKey: ["operationalCost", vehicleId],
    queryFn: () => getVehicleOperationalCost({ vehicleId }),
    enabled: !!vehicleId,
  });
};

export const useAddFuelLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFuelLog,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["fuelLogs"] });
      queryClient.invalidateQueries({ queryKey: ["operationalCost"] });
      toast.success(response.message || "Fuel log recorded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record fuel log.");
    },
  });
};
