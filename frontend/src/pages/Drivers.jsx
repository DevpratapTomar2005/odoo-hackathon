import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDrivers,
  useAddDriver,
  useDeleteDriver,
  useEligibleDriverUsers,
} from "../hooks/useDrivers.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { PERMISSIONS } from "../constants/role.js";

const STATUSES = ["available", "on_trip", "off_duty", "suspended"];

export default function Drivers() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    licenseCategory: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

   const { data, isLoading } = useDrivers(filters);
  const { data: eligibleUsersRes } = useEligibleDriverUsers();
  const { mutateAsync: addDriver, isPending: isAdding } = useAddDriver();
  const { mutateAsync: deleteDriver, isPending: isDeleting } =
    useDeleteDriver();

  const eligibleUsers = eligibleUsersRes?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: "",
      name: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: "",
      contactNumber: "",
      status: "available",
    },
  });

  const drivers = data?.data || [];

  const onSubmit = async (formValues) => {
    try {
      await addDriver({ data: formValues });
      reset();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDriver({ id: deleteTarget.id });
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
            Driver Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Driver profiles, licensing, and availability.
          </p>
        </div>
        <RoleGate roles={PERMISSIONS.MANAGE_DRIVERS}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add Driver
          </button>
        </RoleGate>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <input
          placeholder="Search name or license number"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          placeholder="License category"
          value={filters.licenseCategory}
          onChange={(e) =>
            setFilters((f) => ({ ...f, licenseCategory: e.target.value }))
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
                "Name",
                "License Number",
                "Category",
                "License Expiry",
                "Contact",
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
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Loading drivers...
                </td>
              </tr>
            )}
            {!isLoading && drivers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No drivers found.
                </td>
              </tr>
            )}
            {drivers.map((d) => {
              const expired = new Date(d.licenseExpiryDate) < new Date();
              return (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.licenseNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.licenseCategory}
                  </td>
                  <td
                    className={`px-4 py-3 ${expired ? "font-medium text-red-600" : "text-gray-700"}`}
                  >
                    {d.licenseExpiryDate}
                    {expired && " (expired)"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.contactNumber}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RoleGate roles={PERMISSIONS.MANAGE_DRIVERS}>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(d)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </RoleGate>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Driver"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Driver
            </label>
            <select
              {...register("userId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a user</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Only shows users registered with the "driver" role who don't
              already have a driver profile.
            </p>
            {errors.userId && (
              <p className="text-xs text-red-600">{errors.userId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <input
                {...register("licenseNumber", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.licenseNumber && (
                <p className="text-xs text-red-600">
                  {errors.licenseNumber.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Category
              </label>
              <input
                {...register("licenseCategory", { required: "Required" })}
                placeholder="e.g. Class A"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.licenseCategory && (
                <p className="text-xs text-red-600">
                  {errors.licenseCategory.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Expiry Date
              </label>
              <input
                type="date"
                {...register("licenseExpiryDate", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.licenseExpiryDate && (
                <p className="text-xs text-red-600">
                  {errors.licenseExpiryDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                {...register("contactNumber", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.contactNumber && (
                <p className="text-xs text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>
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
              {isAdding ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Driver"
      >
        <p className="text-sm text-gray-600">
          Delete <span className="font-medium">{deleteTarget?.name}</span>?
          This cannot be undone.
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