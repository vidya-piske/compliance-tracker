import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, FileText, Clock, AlertTriangle, Plus } from "lucide-react";

type Employee = { id: number; name: string; designation: string };
type Case = {
  id: number;
  employee_name: string;
  violation_name: string;
  offense_number: number;
  action: string;
  status: string;
  created_at: string;
};

const actionMeta: Record<string, { label: string; cls: string }> = {
  FIRST_WARNING: { label: "First warning", cls: "text-emerald-300 bg-emerald-500/10" },
  FINAL_WRITTEN_WARNING: { label: "Final written warning", cls: "text-emerald-300 bg-emerald-500/10" },
  SUSPENSION_3_DAYS: { label: "Suspension — 3 days", cls: "text-amber-300 bg-amber-500/10" },
  SUSPENSION_5_DAYS: { label: "Suspension — 5 days", cls: "text-amber-300 bg-amber-500/10" },
  DISMISSAL: { label: "Dismissal", cls: "text-rose-300 bg-rose-500/15" },
};

const statusMeta: Record<string, { label: string; dot: string }> = {
  DRAFT: { label: "Draft", dot: "bg-gray-400" },
  SUBMITTED: { label: "Pending HR", dot: "bg-indigo-400" },
  APPROVED: { label: "Approved", dot: "bg-emerald-400" },
  CLOSED: { label: "Closed", dot: "bg-gray-500" },
  REJECTED: { label: "Rejected", dot: "bg-rose-400" },
  RETURNED: { label: "Returned", dot: "bg-amber-400" },
};

const tints: Record<string, { value: string; chip: string; glow: string }> = {
  indigo: { value: "text-indigo-300", chip: "bg-indigo-500/15 text-indigo-300", glow: "bg-indigo-500/20" },
  violet: { value: "text-fuchsia-200", chip: "bg-fuchsia-500/15 text-fuchsia-300", glow: "bg-fuchsia-500/20" },
  amber: { value: "text-amber-300", chip: "bg-amber-500/15 text-amber-300", glow: "bg-amber-500/20" },
  rose: { value: "text-rose-300", chip: "bg-rose-500/15 text-rose-300", glow: "bg-rose-500/20" },
};

const ESCALATIONS = ["SUSPENSION_3_DAYS", "SUSPENSION_5_DAYS", "DISMISSAL"];

function getInitials(name: string) {
  const w = name.trim().split(" ");
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

function barColor(offense: number) {
  if (offense >= 5) return "from-rose-500 to-red-500";
  if (offense >= 3) return "from-amber-400 to-rose-500";
  return "from-emerald-400 to-amber-400";
}

export default function Overview() {
  const user = useSelector((s: any) => s.auth.user);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    fetch("/api/employees", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setEmployees(Array.isArray(d) ? d : []));
    fetch("/api/cases", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCases(Array.isArray(d) ? d : []));
  }, []);

  const pending = cases.filter((c) => c.status === "SUBMITTED").length;
  const escalations = cases.filter((c) => ESCALATIONS.includes(c.action)).length;

  const kpis = [
    { label: "Team members", value: employees.length, icon: Users, tint: "indigo" },
    { label: "Total cases", value: cases.length, icon: FileText, tint: "violet" },
    { label: "Pending HR", value: pending, icon: Clock, tint: "amber" },
    { label: "Escalations", value: escalations, icon: AlertTriangle, tint: "rose" },
  ];

  const recent = cases.slice(0, 5);

  const byEmployee = new Map<string, Case>();
  for (const c of cases) {
    const cur = byEmployee.get(c.employee_name);
    if (!cur || c.offense_number > cur.offense_number) byEmployee.set(c.employee_name, c);
  }
  const watch = [...byEmployee.values()]
    .sort((a, b) => b.offense_number - a.offense_number)
    .slice(0, 5);

  const violationCounts: Record<string, number> = {};
  for (const c of cases) {
    violationCounts[c.violation_name] = (violationCounts[c.violation_name] ?? 0) + 1;
  }
  const violations = Object.entries(violationCounts).sort((a, b) => b[1] - a[1]);
  const maxViolation = Math.max(1, ...violations.map(([, n]) => n));

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative max-w-5xl">
      <div className="pointer-events-none absolute -top-20 -left-16 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-0 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back, {user?.name || "there"}</h1>
          <p className="text-gray-400 mt-1">{today}</p>
        </div>
        <Link
          to="/dashboard/create"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition shadow-lg shadow-indigo-500/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> File incident
        </Link>
      </div>

      <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const t = tints[k.tint];
          const Icon = k.icon;
          return (
            <div key={k.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-white/20 transition">
              <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl ${t.glow}`} />
              <div className="relative flex items-start justify-between">
                <div className={`text-3xl font-bold ${t.value}`}>{k.value}</div>
                <span className={`grid place-items-center w-9 h-9 rounded-xl ${t.chip}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="relative text-xs uppercase tracking-wider text-gray-500 mt-2">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent cases</h2>
            <Link to="/dashboard/cases" className="text-xs text-indigo-300 hover:text-indigo-200">View all →</Link>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">The latest incidents you've filed</p>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No cases yet.</p>
          ) : (
            recent.map((c) => {
              const st = statusMeta[c.status] ?? { label: c.status, dot: "bg-gray-400" };
              return (
                <div key={c.id} className="flex items-center gap-3 py-2.5 border-t border-white/10 first:border-t-0">
                  <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                    {getInitials(c.employee_name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.employee_name} · {c.violation_name}</div>
                    <div className="text-xs text-gray-500">Offense #{c.offense_number}</div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">⭐ Employees to watch</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">Highest repeat offenders</p>
          {watch.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">Nothing to flag — clean record.</p>
          ) : (
            watch.map((c, i) => {
              const action = actionMeta[c.action] ?? { label: c.action, cls: "text-gray-300 bg-white/10" };
              const pct = Math.min((c.offense_number / 5) * 100, 100);
              return (
                <div key={c.employee_name} className="flex items-center gap-3 py-2.5 border-t border-white/10 first:border-t-0">
                  <span className="w-5 text-center font-bold text-gray-500 shrink-0">{i + 1}</span>
                  <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                    {getInitials(c.employee_name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {c.employee_name} <span className="text-gray-500 font-normal">· {c.violation_name}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <span className={`block h-full rounded-full bg-gradient-to-r ${barColor(c.offense_number)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${action.cls}`}>{action.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Cases by violation</h2>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">Where your team's incidents cluster</p>
        {violations.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No cases yet.</p>
        ) : (
          <div className="space-y-3">
            {violations.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-sm text-gray-300 truncate">{name}</div>
                <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${(count / maxViolation) * 100}%` }} />
                </div>
                <div className="w-6 text-right text-sm font-semibold tabular-nums">{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}