import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTrip,
  getAllTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../services/api/tripsApi.js";
import toast from "react-hot-toast";

export const useTrips = (params = {}) => {
  return useQuery({
    queryKey: ["trips", params],
    queryFn: () => getAllTrips({ params }),
  });
};

export const useTrip = (id) => {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => getTripById({ id }),
    enabled: !!id,
  });
};

const invalidateTripRelated = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["trips"] });
  queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  queryClient.invalidateQueries({ queryKey: ["drivers"] });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: (response) => {
      invalidateTripRelated(queryClient);
      toast.success(response.message || "Trip created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create trip.");
    },
  });
};

export const useDispatchTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchTrip,
    onSuccess: (response) => {
      invalidateTripRelated(queryClient);
      toast.success(response.message || "Trip dispatched successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to dispatch trip.");
    },
  });
};

export const useCompleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeTrip,
    onSuccess: (response) => {
      invalidateTripRelated(queryClient);
      toast.success(response.message || "Trip completed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete trip.");
    },
  });
};

export const useCancelTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelTrip,
    onSuccess: (response) => {
      invalidateTripRelated(queryClient);
      toast.success(response.message || "Trip cancelled successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel trip.");
    },
  });
};
