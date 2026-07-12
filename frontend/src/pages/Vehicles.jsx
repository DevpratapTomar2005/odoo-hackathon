import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useVehicles,
  useAddVehicle,
  useDeleteVehicle,
} from "../hooks/useVehicles.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { PERMISSIONS } from "../constants/role.js";

const STATUSES = ["available", "on_trip", "in_shop", "retired"];

export default function Vehicles() {
  const [filters, setFilters] = useState({ search: "", type: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useVehicles(filters);
  const { mutateAsync: addVehicle, isPending: isAdding } = useAddVehicle();
  const { mutateAsync: deleteVehicle, isPending: isDeleting } =
    useDeleteVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registrationNumber: "",
      name: "",
      type: "",
      maxLoadCapacityKg: "",
      odometerKm: "0",
      acquisitionCost: "",
      status: "available",
    },
  });

  const vehicles = data?.data || [];

  const onSubmit = async (formValues) => {
    try {
      await addVehicle({
        data: {
          ...formValues,
          type: formValues.type.toLowerCase(),
          maxLoadCapacityKg: Number(formValues.maxLoadCapacityKg),
          odometerKm: Number(formValues.odometerKm || 0),
          acquisitionCost: Number(formValues.acquisitionCost),
        },
      });
      reset();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVehicle({ id: deleteTarget.id });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Vehicle Registry
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Master list of fleet vehicles and their current status.
          </p>
        </div>
        <RoleGate roles={PERMISSIONS.MANAGE_VEHICLES}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add Vehicle
          </button>
        </RoleGate>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <input
          placeholder="Search registration or name"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Type (e.g. truck)"
          value={filters.type}
          onChange={(e) =>
            setFilters((f) => ({ ...f, type: e.target.value }))
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Registration",
                "Name",
                "Type",
                "Max Load (kg)",
                "Odometer (km)",
                "Acquisition Cost",
                "Status",
                "",
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
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            )}
            {!isLoading && vehicles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {v.registrationNumber}
                </td>
                <td className="px-4 py-3 text-gray-700">{v.name}</td>
                <td className="px-4 py-3 text-gray-700">{v.type}</td>
                <td className="px-4 py-3 text-gray-700">
                  {v.maxLoadCapacityKg}
                </td>
                <td className="px-4 py-3 text-gray-700">{v.odometerKm}</td>
                <td className="px-4 py-3 text-gray-700">
                  {v.acquisitionCost}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RoleGate roles={PERMISSIONS.MANAGE_VEHICLES}>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(v)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </RoleGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Vehicle"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              {...register("registrationNumber", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.registrationNumber && (
              <p className="text-xs text-red-600">
                {errors.registrationNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name / Model
            </label>
            <input
              {...register("name", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <input
                {...register("type", { required: "Required" })}
                placeholder="Truck, Van, ..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.type && (
                <p className="text-xs text-red-600">{errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register("status")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Load Capacity (kg)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("maxLoadCapacityKg", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.maxLoadCapacityKg && (
                <p className="text-xs text-red-600">
                  {errors.maxLoadCapacityKg.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Odometer (km)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("odometerKm")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Acquisition Cost
            </label>
            <input
              type="number"
              step="0.01"
              {...register("acquisitionCost", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.acquisitionCost && (
              <p className="text-xs text-red-600">
                {errors.acquisitionCost.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isAdding ? "Saving..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Vehicle"
      >
        <p className="text-sm text-gray-600">
          Delete <span className="font-medium">{deleteTarget?.name}</span> (
          {deleteTarget?.registrationNumber})? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={confirmDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}