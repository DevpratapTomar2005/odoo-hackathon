import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addExpense,
  getAllExpenses,
} from "../services/api/expensesApi.js";
import toast from "react-hot-toast";

export const useExpenses = (params = {}) => {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => getAllExpenses({ params }),
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addExpense,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(response.message || "Expense recorded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record expense.");
    },
  });
};
