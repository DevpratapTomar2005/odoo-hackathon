import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useMaintenanceLogs,
  useCreateMaintenanceLog,
  useCloseMaintenanceLog,
} from "../hooks/useMaintenance.js";
import { useVehicles } from "../hooks/useVehicles.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { PERMISSIONS } from "../constants/role.js";

export default function Maintenance() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);

  const { data: logsRes, isLoading } = useMaintenanceLogs(filters);
  const { data: vehiclesRes } = useVehicles();
  const { data: eligibleVehiclesRes } = useVehicles({ status: "available" });

  const { mutateAsync: createLog, isPending: isCreating } =
    useCreateMaintenanceLog();
  const { mutateAsync: closeLog, isPending: isClosing } =
    useCloseMaintenanceLog();

  const logs = logsRes?.data || [];
  const allVehicles = vehiclesRes?.data || [];
  const eligibleVehicles = eligibleVehiclesRes?.data || [];

  const vehicleMap = useMemo(
    () => new Map(allVehicles.map((v) => [v.id, v])),
    [allVehicles],
  );

  const createForm = useForm({
    defaultValues: {
      vehicleId: "",
      serviceTyp: "",
      cost: "",
      serviceDate: "",
    },
  });

  const closeForm = useForm({ defaultValues: { cost: "" } });

  const onCreate = async (values) => {
    try {
      await createLog({
        data: {
          ...values,
          cost: values.cost ? Number(values.cost) : undefined,
        },
      });
      createForm.reset();
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onClose = async (values) => {
    if (!closeTarget) return;
    try {
      await closeLog({
        id: closeTarget.id,
        data: { cost: values.cost ? Number(values.cost) : undefined },
      });
      closeForm.reset();
      setCloseTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Maintenance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Opening a log automatically moves the vehicle to "In Shop".
          </p>
        </div>
        <RoleGate roles={PERMISSIONS.MANAGE_MAINTENANCE}>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New Maintenance Log
          </button>
        </RoleGate>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <input
          placeholder="Search service type"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Vehicle", "Service Type", "Cost", "Service Date", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Loading maintenance logs...
                </td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No maintenance logs found.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {vehicleMap.get(log.vehicleId)?.registrationNumber || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">{log.serviceTyp}</td>
                <td className="px-4 py-3 text-gray-700">{log.cost}</td>
                <td className="px-4 py-3 text-gray-700">{log.serviceDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={log.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {log.status === "active" && (
                    <RoleGate roles={PERMISSIONS.MANAGE_MAINTENANCE}>
                      <button
                        type="button"
                        onClick={() => setCloseTarget(log)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                      >
                        Close
                      </button>
                    </RoleGate>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Maintenance Log"
      >
        <form
          onSubmit={createForm.handleSubmit(onCreate)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              {...createForm.register("vehicleId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a vehicle</option>
              {eligibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Only vehicles that are currently available are eligible.
            </p>
            {createForm.formState.errors.vehicleId && (
              <p className="text-xs text-red-600">
                {createForm.formState.errors.vehicleId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <input
              {...createForm.register("serviceTyp", { required: "Required" })}
              placeholder="Oil change, brake repair, ..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {createForm.formState.errors.serviceTyp && (
              <p className="text-xs text-red-600">
                {createForm.formState.errors.serviceTyp.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                {...createForm.register("cost")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Date
              </label>
              <input
                type="date"
                {...createForm.register("serviceDate", {
                  required: "Required",
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {createForm.formState.errors.serviceDate && (
                <p className="text-xs text-red-600">
                  {createForm.formState.errors.serviceDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isCreating ? "Saving..." : "Create Log"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        title="Close Maintenance Log"
      >
        <form onSubmit={closeForm.handleSubmit(onClose)} className="space-y-4">
          <p className="text-sm text-gray-600">
            Closing this log returns{" "}
            <span className="font-medium">
              {vehicleMap.get(closeTarget?.vehicleId)?.registrationNumber}
            </span>{" "}
            to Available status.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Final Cost (optional override)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={String(closeTarget?.cost ?? "")}
              {...closeForm.register("cost")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCloseTarget(null)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isClosing}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isClosing ? "Closing..." : "Close Log"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}