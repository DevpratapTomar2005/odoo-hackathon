import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useTrips,
  useCreateTrip,
  useDispatchTrip,
  useCompleteTrip,
  useCancelTrip,
} from "../hooks/useTrips.js";
import { useVehicles } from "../hooks/useVehicles.js";
import { useDrivers } from "../hooks/useDrivers.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { PERMISSIONS } from "../constants/role.js";

const STATUSES = ["draft", "dispatched", "completed", "cancelled"];

export default function Trips() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data: tripsRes, isLoading } = useTrips(filters);
  const { data: vehiclesRes } = useVehicles();
  const { data: availableVehiclesRes } = useVehicles({ status: "available" });
  const { data: driversRes } = useDrivers();
  const { data: availableDriversRes } = useDrivers({ status: "available" });

  const { mutateAsync: createTrip, isPending: isCreating } = useCreateTrip();
  const { mutateAsync: dispatchTrip, isPending: isDispatching } =
    useDispatchTrip();
  const { mutateAsync: completeTrip, isPending: isCompleting } =
    useCompleteTrip();
  const { mutateAsync: cancelTrip, isPending: isCancelling } =
    useCancelTrip();

  const trips = tripsRes?.data || [];
  const allVehicles = vehiclesRes?.data || [];
  const allDrivers = driversRes?.data || [];
  const availableVehicles = availableVehiclesRes?.data || [];
  const availableDrivers = availableDriversRes?.data || [];

  const vehicleMap = useMemo(
    () => new Map(allVehicles.map((v) => [v.id, v])),
    [allVehicles],
  );
  const driverMap = useMemo(
    () => new Map(allDrivers.map((d) => [d.id, d])),
    [allDrivers],
  );

  const createForm = useForm({
    defaultValues: {
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargoWeightKg: "",
      plannedDistanceKm: "",
    },
  });

  const completeForm = useForm({
    defaultValues: {
      endOdometerKm: "",
      actualDistanceKm: "",
      fuelConsumedLiters: "",
    },
  });

  const onCreate = async (values) => {
    try {
      await createTrip({
        data: {
          ...values,
          cargoWeightKg: Number(values.cargoWeightKg),
          plannedDistanceKm: Number(values.plannedDistanceKm),
        },
      });
      createForm.reset();
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onDispatch = async (id) => {
    try {
      await dispatchTrip({ id });
    } catch (err) {
      console.error(err);
    }
  };

  const onComplete = async (values) => {
    if (!completeTarget) return;
    try {
      await completeTrip({
        id: completeTarget.id,
        data: {
          endOdometerKm: Number(values.endOdometerKm),
          actualDistanceKm: values.actualDistanceKm
            ? Number(values.actualDistanceKm)
            : undefined,
          fuelConsumedLiters: values.fuelConsumedLiters
            ? Number(values.fuelConsumedLiters)
            : undefined,
        },
      });
      completeForm.reset();
      setCompleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const onCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelTrip({ id: cancelTarget.id });
      setCancelTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Trip Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Draft → Dispatched → Completed / Cancelled.
          </p>
        </div>
        <RoleGate roles={PERMISSIONS.MANAGE_TRIPS}>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Create Trip
          </button>
        </RoleGate>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <input
          placeholder="Search source or destination"
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Route",
                "Vehicle",
                "Driver",
                "Cargo (kg)",
                "Planned (km)",
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
                  Loading trips...
                </td>
              </tr>
            )}
            {!isLoading && trips.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No trips found.
                </td>
              </tr>
            )}
            {trips.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {t.source} → {t.destination}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {vehicleMap.get(t.vehicleId)?.registrationNumber || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {driverMap.get(t.driverId)?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">{t.cargoWeightKg}</td>
                <td className="px-4 py-3 text-gray-700">
                  {t.plannedDistanceKm}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <RoleGate roles={PERMISSIONS.MANAGE_TRIPS}>
                    <div className="flex justify-end gap-3">
                      {t.status === "draft" && (
                        <button
                          type="button"
                          disabled={isDispatching}
                          onClick={() => onDispatch(t.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                        >
                          Dispatch
                        </button>
                      )}
                      {t.status === "dispatched" && (
                        <button
                          type="button"
                          onClick={() => setCompleteTarget(t)}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                        >
                          Complete
                        </button>
                      )}
                      {(t.status === "draft" || t.status === "dispatched") && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(t)}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </RoleGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Trip"
      >
        <form
          onSubmit={createForm.handleSubmit(onCreate)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <input
                {...createForm.register("source", { required: "Required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {createForm.formState.errors.source && (
                <p className="text-xs text-red-600">
                  {createForm.formState.errors.source.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                {...createForm.register("destination", {
                  required: "Required",
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {createForm.formState.errors.destination && (
                <p className="text-xs text-red-600">
                  {createForm.formState.errors.destination.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              {...createForm.register("vehicleId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select an available vehicle</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.name}
                </option>
              ))}
            </select>
            {createForm.formState.errors.vehicleId && (
              <p className="text-xs text-red-600">
                {createForm.formState.errors.vehicleId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Driver
            </label>
            <select
              {...createForm.register("driverId", { required: "Required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select an available driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.licenseNumber}
                </option>
              ))}
            </select>
            {createForm.formState.errors.driverId && (
              <p className="text-xs text-red-600">
                {createForm.formState.errors.driverId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cargo Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                {...createForm.register("cargoWeightKg", {
                  required: "Required",
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {createForm.formState.errors.cargoWeightKg && (
                <p className="text-xs text-red-600">
                  {createForm.formState.errors.cargoWeightKg.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Planned Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                {...createForm.register("plannedDistanceKm", {
                  required: "Required",
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {createForm.formState.errors.plannedDistanceKm && (
                <p className="text-xs text-red-600">
                  {createForm.formState.errors.plannedDistanceKm.message}
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
              {isCreating ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="Complete Trip"
      >
        <form
          onSubmit={completeForm.handleSubmit(onComplete)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Final Odometer Reading (km)
            </label>
            <input
              type="number"
              step="0.1"
              {...completeForm.register("endOdometerKm", {
                required: "Required",
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {completeForm.formState.errors.endOdometerKm && (
              <p className="text-xs text-red-600">
                {completeForm.formState.errors.endOdometerKm.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Actual Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={String(completeTarget?.plannedDistanceKm || "")}
              {...completeForm.register("actualDistanceKm")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fuel Consumed (liters)
            </label>
            <input
              type="number"
              step="0.01"
              {...completeForm.register("fuelConsumedLiters")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCompleteTarget(null)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCompleting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isCompleting ? "Completing..." : "Complete Trip"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Trip"
      >
        <p className="text-sm text-gray-600">
          Cancel the trip from{" "}
          <span className="font-medium">{cancelTarget?.source}</span> to{" "}
          <span className="font-medium">{cancelTarget?.destination}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Keep Trip
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onCancel}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Cancel Trip"}
          </button>
        </div>
      </Modal>
    </div>
  );
}