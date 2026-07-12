const STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  on_trip: "bg-blue-50 text-blue-700 ring-blue-200",
  in_shop: "bg-amber-50 text-amber-700 ring-amber-200",
  retired: "bg-gray-100 text-gray-600 ring-gray-200",
  off_duty: "bg-gray-100 text-gray-600 ring-gray-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  dispatched: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  active: "bg-amber-50 text-amber-700 ring-amber-200",
};

const LABELS = {
  on_trip: "On Trip",
  in_shop: "In Shop",
  off_duty: "Off Duty",
};

const formatLabel = (status) =>
  LABELS[status] ||
  status
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] || "bg-gray-100 text-gray-600 ring-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {formatLabel(status) || "Unknown"}
    </span>
  );
}