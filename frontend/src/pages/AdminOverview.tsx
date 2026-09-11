import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FileText, Clock, Check, Users } from "lucide-react";

type Case = {
  id: number;
  manager_name: string;
  violation_name: string;
  status: string;
};
type User = { id: number; name: string; email: string | null; role: string };

const tints: Record<string, { value: string; chip: string; glow: string }> = {
  indigo: { value: "text-indigo-300", chip: "bg-indigo-500/15 text-indigo-300", glow: "bg-indigo-500/20" },
  amber: { value: "text-amber-300", chip: "bg-amber-500/15 text-amber-300", glow: "bg-amber-500/20" },
  emerald: { value: "text-emerald-300", chip: "bg-emerald-500/15 text-emerald-300", glow: "bg-emerald-500/20" },
  fuchsia: { value: "text-fuchsia-200", chip: "bg-fuchsia-500/15 text-fuchsia-300", glow: "bg-fuchsia-500/20" },
};

function countBy<T>(items: T[], key: (x: T) => string) {
  const map: Record<string, number> = {};
  for (const x of items) map[key(x)] = (map[key(x)] ?? 0) + 1;
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function AdminOverview() {
  const user = useSelector((s: any) => s.auth.user);
  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCases(Array.isArray(d) ? d : []));
    fetch("/api/users", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUsers(Array.isArray(d) ? d : []));
  }, []);

  const pending = cases.filter((c) => c.status === "SUBMITTED").length;
  const approved = cases.filter((c) =>
    ["APPROVED", "ACKNOWLEDGED", "CLOSED"].includes(c.status),
  ).length;

  const kpis = [
    { label: "Total cases", value: cases.length, icon: FileText, tint: "indigo" },
    { label: "Pending HR", value: pending, icon: Clock, tint: "amber" },
    { label: "Approved+", value: approved, icon: Check, tint: "emerald" },
    { label: "Users", value: users.length, icon: Users, tint: "fuchsia" },
  ];

  const byManager = countBy(cases, (c) => c.manager_name).slice(0, 6);
  const maxManager = Math.max(1, ...byManager.map(([, n]) => n));
  const byViolation = countBy(cases, (c) => c.violation_name);
  const maxViolation = Math.max(1, ...byViolation.map(([, n]) => n));
  const byRole = countBy(users, (u) => u.role);

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

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">Admin overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back, {user?.name || "there"}</h1>
        <p className="text-gray-400 mt-1">{today} · organization-wide view</p>
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
          <h2 className="font-semibold">Cases by manager</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">Who's filing across the org</p>
          {byManager.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No cases yet.</p>
          ) : (
            <div className="space-y-3">
              {byManager.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-gray-300 truncate">{name}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <span className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${(count / maxManager) * 100}%` }} />
                  </div>
                  <div className="w-6 text-right text-sm font-semibold tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Cases by violation</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">Where incidents cluster</p>
          {byViolation.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No cases yet.</p>
          ) : (
            <div className="space-y-3">
              {byViolation.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-gray-300 truncate">{name}</div>
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

      <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">People by role</h2>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">Everyone with a login</p>
        <div className="flex flex-wrap gap-3">
          {byRole.map(([role, count]) => (
            <div key={role} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5">
              <span className="text-lg font-bold">{count}</span>{" "}
              <span className="text-sm text-gray-400 capitalize">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
