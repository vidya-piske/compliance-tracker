import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { useState } from "react";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
    isActive
      ? "bg-gradient-to-r from-indigo-500/25 to-fuchsia-500/20 border border-white/15 text-white"
      : "text-gray-400 hover:text-white hover:bg-white/5"
  }`;

export default function DashboardLayout() {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      dispatch(clearUser());
      navigate("/login");
    } catch {
      setLoading(false);
    }
  }

  const navItems =
    user?.role === "hr"
      ? [
          { to: "/dashboard", label: "Overview", end: true },
          { to: "/dashboard/review", label: "Review queue" },
          { to: "/dashboard/rules", label: "Rule book" },
        ]
      : user?.role === "employee"
      ? [
          { to: "/dashboard", label: "Overview", end: true },
          { to: "/dashboard/my-cases", label: "My cases" },
          { to: "/dashboard/rules", label: "Rule book" },
        ]
      : user?.role === "admin"
      ? [
          { to: "/dashboard", label: "Overview", end: true },
          { to: "/dashboard/users", label: "Users" },
          { to: "/dashboard/manage-rules", label: "Manage rules" },
          { to: "/dashboard/rules", label: "Rule book" },
        ]
      : [
          { to: "/dashboard", label: "Overview", end: true },
          { to: "/dashboard/employees", label: "Employees" },
          { to: "/dashboard/create", label: "Create incident" },
          { to: "/dashboard/cases", label: "Cases" },
          { to: "/dashboard/rules", label: "Rule book" },
        ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3 font-bold text-lg">
            <span className="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
            <span className="whitespace-nowrap">Compliance Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-300 truncate max-w-[160px]">
              {user?.name || user?.email}
            </span>
            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition disabled:opacity-60"
          >
            {loading && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            )}
            {loading ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}

        <aside
          className={`fixed z-40 top-0 left-0 h-full w-64 bg-[#0a0a14] border-r border-white/10 p-4 flex flex-col gap-2 transform transition-transform duration-200
            lg:static lg:z-auto lg:h-auto lg:w-56 lg:min-h-[calc(100vh-65px)] lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 px-4">
              Menu
            </p>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
