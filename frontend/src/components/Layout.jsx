import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useLogout } from "../hooks/useAuth.js";
import { useCurrentUser } from "./RoleGate.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/drivers", label: "Drivers" },
  { to: "/trips", label: "Trips" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/fuel-expenses", label: "Fuel & Expenses" },
];

const ROLE_LABELS = {
  fleet_manager: "Fleet Manager",
  driver: "Driver",
  safety_officer: "Safety Officer",
  financial_officer: "Financial Officer",
  trip_dispatcher: "Trip Dispatcher",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  const navLinkClasses = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate("/", { replace: true }) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle navigation menu"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            FleetOps
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {ROLE_LABELS[user?.role] || user?.role}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-4 lg:block">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-900/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative z-10 h-full w-64 bg-white px-3 py-4 shadow-xl">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={navLinkClasses}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}