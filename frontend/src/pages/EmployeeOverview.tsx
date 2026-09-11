import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FileText, Bell, Check, ArrowRight } from "lucide-react";

type Case = {
  id: number;
  manager_name: string;
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

const tints: Record<string, { value: string; chip: string; glow: string }> = {
  indigo: { value: "text-indigo-300", chip: "bg-indigo-500/15 text-indigo-300", glow: "bg-indigo-500/20" },
  amber: { value: "text-amber-300", chip: "bg-amber-500/15 text-amber-300", glow: "bg-amber-500/20" },
  emerald: { value: "text-emerald-300", chip: "bg-emerald-500/15 text-emerald-300", glow: "bg-emerald-500/20" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const VISIBLE = ["APPROVED", "ACKNOWLEDGED", "CLOSED"];

export default function EmployeeOverview() {
  const user = useSelector((s: any) => s.auth.user);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) =>
        setCases(
          (Array.isArray(d) ? d : []).filter((c: Case) =>
            VISIBLE.includes(c.status),
          ),
        ),
      );
  }, []);

  const toAck = cases.filter((c) => c.status === "APPROVED");
  const acked = cases.filter(
    (c) => c.status === "ACKNOWLEDGED" || c.status === "CLOSED",
  );

  const kpis = [
    { label: "On record", value: cases.length, icon: FileText, tint: "indigo" },
    { label: "To acknowledge", value: toAck.length, icon: Bell, tint: "amber" },
    { label: "Acknowledged", value: acked.length, icon: Check, tint: "emerald" },
  ];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative max-w-4xl">
      <div className="pointer-events-none absolute -top-20 -left-16 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-0 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          My record
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || "there"}
        </h1>
        <p className="text-gray-400 mt-1">{today}</p>
      </div>

      {/* KPI cards */}
      <div className="relative mt-6 grid grid-cols-3 gap-4">
        {kpis.map((k) => {
          const t = tints[k.tint];
          const Icon = k.icon;
          return (
            <div key={k.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5">
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

      {/* action-needed banner */}
      {toAck.length > 0 ? (
        <div className="relative mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <div className="font-semibold">
                {toAck.length} case{toAck.length === 1 ? "" : "s"} need your acknowledgment
              </div>
              <div className="text-sm text-gray-400">
                Please review and acknowledge each one.
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/my-cases"
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition whitespace-nowrap"
          >
            Review <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-gray-400">
          🎉 You're all caught up — nothing to acknowledge.
        </div>
      )}

      {/* record list */}
      <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your record</h2>
          <Link to="/dashboard/my-cases" className="text-xs text-indigo-300 hover:text-indigo-200">
            View all →
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">Corrective actions on file</p>
        {cases.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">🎉 Clean record — no cases.</p>
        ) : (
          cases.slice(0, 5).map((c) => {
            const action = actionMeta[c.action] ?? {
              label: c.action,
              cls: "text-gray-300 bg-white/10",
            };
            const acked = c.status === "ACKNOWLEDGED" || c.status === "CLOSED";
            return (
              <div key={c.id} className="flex items-center gap-3 py-2.5 border-t border-white/10 first:border-t-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.violation_name}</div>
                  <div className="text-xs text-gray-500">
                    Offense #{c.offense_number} · {formatDate(c.created_at)}
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${action.cls}`}>
                  {action.label}
                </span>
                <span className={`text-xs whitespace-nowrap ${acked ? "text-emerald-300" : "text-amber-300"}`}>
                  {acked ? "Acknowledged" : "Pending"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
