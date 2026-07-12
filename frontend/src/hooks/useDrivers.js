import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDriver,
  getAllDrivers,
  deleteDriver,
  getUsersByRole,
} from "../services/api/driversApi.js";
import toast from "react-hot-toast";

export const useDrivers = (params = {}) => {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => getAllDrivers({ params }),
  });
};

export const useAddDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDriver,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(response.message || "Driver added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add driver.");
    },
  });
};

export const useEligibleDriverUsers = () => {
  const { data: driversRes } = useDrivers();
  return useQuery({
    queryKey: ["eligibleDriverUsers"],
    queryFn: () => getUsersByRole({ role: "driver" }),
    select: (response) => {
      const linkedUserIds = new Set(
        (driversRes?.data || []).map((d) => d.userId),
      );
      return {
        ...response,
        data: (response.data || []).filter((u) => !linkedUserIds.has(u.id)),
      };

}})};


export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(response.message || "Driver deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete driver.");
    },
  });
};
