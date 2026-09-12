import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Clock, Check, Undo2, FileText, ArrowRight } from "lucide-react";

type Case = {
  id: number;
  employee_name: string;
  manager_name: string;
  violation_name: string;
  offense_number: number;
  action: string;
  status: string;
  created_at: string;
};

const tints: Record<string, { value: string; chip: string; glow: string }> = {
  amber: { value: "text-amber-300", chip: "bg-amber-500/15 text-amber-300", glow: "bg-amber-500/20" },
  emerald: { value: "text-emerald-300", chip: "bg-emerald-500/15 text-emerald-300", glow: "bg-emerald-500/20" },
  rose: { value: "text-rose-300", chip: "bg-rose-500/15 text-rose-300", glow: "bg-rose-500/20" },
  indigo: { value: "text-indigo-300", chip: "bg-indigo-500/15 text-indigo-300", glow: "bg-indigo-500/20" },
};

function getInitials(name: string) {
  const w = name.trim().split(" ");
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

function countBy(items: Case[], key: (c: Case) => string) {
  const map: Record<string, number> = {};
  for (const c of items) map[key(c)] = (map[key(c)] ?? 0) + 1;
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function HROverview() {
  const user = useSelector((s: any) => s.auth.user);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCases(Array.isArray(d) ? d : []));
  }, []);

  const pendingCases = cases.filter((c) => c.status === "SUBMITTED");
  const pending = pendingCases.length;
  const approved = cases.filter((c) =>
    ["APPROVED", "ACKNOWLEDGED", "CLOSED"].includes(c.status),
  ).length;
  const returned = cases.filter((c) => c.status === "RETURNED").length;

  const kpis = [
    { label: "Pending review", value: pending, icon: Clock, tint: "amber" },
    { label: "Approved", value: approved, icon: Check, tint: "emerald" },
    { label: "Returned", value: returned, icon: Undo2, tint: "rose" },
    { label: "Total cases", value: cases.length, icon: FileText, tint: "indigo" },
  ];

  const byViolation = countBy(cases, (c) => c.violation_name);
  const maxViolation = Math.max(1, ...byViolation.map(([, n]) => n));
  const byManager = countBy(cases, (c) => c.manager_name).slice(0, 5);
  const maxManager = Math.max(1, ...byManager.map(([, n]) => n));

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">HR overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back, {user?.name || "there"}</h1>
          <p className="text-gray-400 mt-1">{today}</p>
        </div>
        <Link
          to="/dashboard/review"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition shadow-lg shadow-indigo-500/30 whitespace-nowrap"
        >
          Review queue <ArrowRight className="w-4 h-4" />
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
            <h2 className="font-semibold">Awaiting your review</h2>
            <Link to="/dashboard/review" className="text-xs text-indigo-300 hover:text-indigo-200">Open queue →</Link>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">The oldest pending cases</p>
          {pendingCases.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">🎉 Nothing pending — all caught up.</p>
          ) : (
            [...pendingCases].reverse().slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2.5 border-t border-white/10 first:border-t-0">
                <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                  {getInitials(c.employee_name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.employee_name} · {c.violation_name}</div>
                  <div className="text-xs text-gray-500">Filed by {c.manager_name}</div>
                </div>
              </div>
            ))
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
        <h2 className="font-semibold">Most active managers</h2>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">Who's filing the most cases</p>
        {byManager.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No cases yet.</p>
        ) : (
          <div className="space-y-3">
            {byManager.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-semibold">
                  {getInitials(name)}
                </span>
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
    </div>
  );
}
