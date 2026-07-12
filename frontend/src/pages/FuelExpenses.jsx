import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useFuelLogs,
  useAddFuelLog,
  useAllVehiclesOperationalCost,
} from "../hooks/useFuel.js";
import { useExpenses, useAddExpense } from "../hooks/useExpenses.js";
import { useVehicles } from "../hooks/useVehicles.js";
import { useTrips } from "../hooks/useTrips.js";
import Modal from "../components/Modal.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { PERMISSIONS } from "../constants/role.js";

const EXPENSE_TYPES = ["toll", "permit", "fine", "parking", "other"];

export default function FuelExpenses() {
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const { data: vehiclesRes } = useVehicles();
  const { data: tripsRes } = useTrips();
  const { data: fuelLogsRes, isLoading: fuelLoading } = useFuelLogs(
    vehicleFilter ? { vehicleId: vehicleFilter } : {},
  );
  const { data: expensesRes, isLoading: expensesLoading } = useExpenses(
    vehicleFilter ? { vehicleId: vehicleFilter } : {},
  );
  const { data: costRes, isLoading: costLoading } =
    useAllVehiclesOperationalCost();

  const { mutateAsync: addFuelLog, isPending: isAddingFuel } =
    useAddFuelLog();
  const { mutateAsync: addExpense, isPending: isAddingExpense } =
    useAddExpense();

  const vehicles = vehiclesRes?.data || [];
  const trips = tripsRes?.data || [];
  const fuelLogs = fuelLogsRes?.data || [];
  const expenses = expensesRes?.data || [];
  const operationalCosts = costRes?.data || [];

  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const fuelForm = useForm({
    defaultValues: {
      vehicleId: "",
      tripId: "",
      liters: "",
      cost: "",
      date: "",
    },
  });

  const expenseForm = useForm({
    defaultValues: { vehicleId: "", type: "toll", amount: "", date: "" },
  });

  const onAddFuelLog = async (values) => {
    try {
      await addFuelLog({
        data: {
          ...values,
          tripId: values.tripId || undefined,
          liters: Number(values.liters),
          cost: Number(values.cost),
        },
      });
      fuelForm.reset();
      setFuelModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onAddExpense = async (values) => {
    try {
      await addExpense({
        data: { ...values, amount: Number(values.amount) },
      });
      expenseForm.reset();
      setExpenseModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Fuel & Expenses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track fuel logs, tolls, and other costs per vehicle.
          </p>
        </div>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} — {v.name}
            </option>
          ))}
        </select>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Operational Cost per Vehicle
        </h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Vehicle",
                  "Fuel Cost",
                  "Maintenance Cost",
                  "Total Operational Cost",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {costLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Calculating operational costs...
                  </td>
                </tr>
              )}
              {!costLoading && operationalCosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No data yet.
                  </td>
                </tr>
              )}
              {operationalCosts.map((row) => (
                <tr key={row.vehicleId}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.registrationNumber} — {row.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.totalFuelCost}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.totalMaintenanceCost}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {row.totalOperationalCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Fuel Logs</h2>
          <RoleGate roles={PERMISSIONS.MANAGE_FUEL_EXPENSES}>
            <button
              type="button"
              onClick={() => setFuelModalOpen(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add Fuel Log
            </button>
          </RoleGate>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Vehicle", "Trip", "Liters", "Cost", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fuelLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Loading fuel logs...
                  </td>
                </tr>
              )}
              {!fuelLoading && fuelLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No fuel logs found.
                  </td>
                </tr>
              )}
              {fuelLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {vehicleMap.get(log.vehicleId)?.registrationNumber || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.tripId
                      ? `${log.tripId.toString().slice(0, 8)}...`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.liters}</td>
                  <td className="px-4 py-3 text-gray-700">{log.cost}</td>
                  <td className="px-4 py-3 text-gray-700">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Other Expenses
          </h2>
          <RoleGate roles={PERMISSIONS.MANAGE_FUEL_EXPENSES}>
            <button
              type="button"
              onClick={() => setExpenseModalOpen(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Add Expense
            </button>
          </RoleGate>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Vehicle", "Type", "Amount", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expensesLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              )}
              {!expensesLoading && expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              )}
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {vehicleMap.get(exp.vehicleId)?.registrationNumber || "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">
                    {exp.type}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{exp.amount}</td>
                  <td className="px-4 py-3 text-gray-700">{exp.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        title="Add Fuel Log"
      >
        <form onSubmit={fuelForm.handleSubmit(onAddFuelLog)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              {...fuelForm.register("vehicleId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
            {fuelForm.formState.errors.vehicleId && (
              <p className="text-xs text-red-600">
                {fuelForm.formState.errors.vehicleId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trip (optional)
            </label>
            <select
              {...fuelForm.register("tripId")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Not linked to a trip</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.source} → {t.destination}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Liters
              </label>
              <input
                type="number"
                step="0.01"
                {...fuelForm.register("liters", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {fuelForm.formState.errors.liters && (
                <p className="text-xs text-red-600">
                  {fuelForm.formState.errors.liters.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                {...fuelForm.register("cost", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {fuelForm.formState.errors.cost && (
                <p className="text-xs text-red-600">
                  {fuelForm.formState.errors.cost.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              {...fuelForm.register("date", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {fuelForm.formState.errors.date && (
              <p className="text-xs text-red-600">
                {fuelForm.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFuelModalOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingFuel}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isAddingFuel ? "Saving..." : "Save Fuel Log"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Add Expense"
      >
        <form
          onSubmit={expenseForm.handleSubmit(onAddExpense)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              {...expenseForm.register("vehicleId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
            {expenseForm.formState.errors.vehicleId && (
              <p className="text-xs text-red-600">
                {expenseForm.formState.errors.vehicleId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                {...expenseForm.register("type", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {EXPENSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...expenseForm.register("amount", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {expenseForm.formState.errors.amount && (
                <p className="text-xs text-red-600">
                  {expenseForm.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              {...expenseForm.register("date", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {expenseForm.formState.errors.date && (
              <p className="text-xs text-red-600">
                {expenseForm.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setExpenseModalOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingExpense}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isAddingExpense ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}