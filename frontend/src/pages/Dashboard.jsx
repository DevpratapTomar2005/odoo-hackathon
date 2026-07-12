import { useMemo, useState } from "react";
import { useVehicles } from "../hooks/useVehicles.js";
import { useDrivers } from "../hooks/useDrivers.js";
import { useTrips } from "../hooks/useTrips.js";

const VEHICLE_STATUSES = ["available", "on_trip", "in_shop", "retired"];

function KpiCard({ label, value, accent = "text-gray-900" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${accent}`}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({ type: "", status: "" });

  const { data: vehiclesRes, isLoading: vehiclesLoading } = useVehicles();
  const { data: driversRes, isLoading: driversLoading } = useDrivers();
  const { data: tripsRes, isLoading: tripsLoading } = useTrips();

  const allVehicles = vehiclesRes?.data || [];
  const allDrivers = driversRes?.data || [];
  const allTrips = tripsRes?.data || [];

  const vehicleTypes = useMemo(
    () => [...new Set(allVehicles.map((v) => v.type).filter(Boolean))],
    [allVehicles],
  );

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((v) => {
      if (filters.type && v.type !== filters.type) return false;
      if (filters.status && v.status !== filters.status) return false;
      return true;
    });
  }, [allVehicles, filters]);

  const nonRetired = filteredVehicles.filter((v) => v.status !== "retired");
  const availableVehicles = filteredVehicles.filter(
    (v) => v.status === "available",
  );
  const inMaintenance = filteredVehicles.filter(
    (v) => v.status === "in_shop",
  );
  const onTrip = filteredVehicles.filter((v) => v.status === "on_trip");

  const activeTrips = allTrips.filter((t) => t.status === "dispatched");
  const pendingTrips = allTrips.filter((t) => t.status === "draft");
  const driversOnDuty = allDrivers.filter(
    (d) => d.status === "available" || d.status === "on_trip",
  );

  const utilization =
    nonRetired.length > 0
      ? Math.round((onTrip.length / nonRetired.length) * 100)
      : 0;

  const isLoading = vehiclesLoading || driversLoading || tripsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fleet overview and key operating metrics.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Vehicle type
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value }))
            }
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All types</option>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-medium text-gray-400"
            title="Region filtering needs a region field on the vehicle record"
          >
            Region
          </label>
          <select
            disabled
            className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400"
            title="Region filtering needs a region field on the vehicle record"
          >
            <option>All regions</option>
          </select>
        </div>

        {(filters.type || filters.status) && (
          <button
            type="button"
            onClick={() => setFilters({ type: "", status: "" })}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Vehicles" value={nonRetired.length} />
          <KpiCard
            label="Available Vehicles"
            value={availableVehicles.length}
            accent="text-emerald-600"
          />
          <KpiCard
            label="Vehicles in Maintenance"
            value={inMaintenance.length}
            accent="text-amber-600"
          />
          <KpiCard
            label="Active Trips"
            value={activeTrips.length}
            accent="text-blue-600"
          />
          <KpiCard
            label="Pending Trips"
            value={pendingTrips.length}
            accent="text-slate-600"
          />
          <KpiCard label="Drivers On Duty" value={driversOnDuty.length} />
          <KpiCard
            label="Fleet Utilization"
            value={`${utilization}%`}
            accent="text-indigo-600"
          />
        </div>
      )}
    </div>
  );
}