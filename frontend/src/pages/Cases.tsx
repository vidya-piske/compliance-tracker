import { useEffect, useState } from "react";

type Case = {
  id: number;
  employee_name: string;
  violation_name: string;
  offense_number: number;
  action: string;
  status: string;
  description: string | null;
  created_at: string;
};

const actionMeta: Record<string, { label: string; cls: string }> = {
  FIRST_WARNING: { label: "First warning", cls: "text-emerald-300 bg-emerald-500/10" },
  FINAL_WRITTEN_WARNING: { label: "Final written warning", cls: "text-emerald-300 bg-emerald-500/10" },
  SUSPENSION_3_DAYS: { label: "Suspension — 3 days", cls: "text-amber-300 bg-amber-500/10" },
  SUSPENSION_5_DAYS: { label: "Suspension — 5 days", cls: "text-amber-300 bg-amber-500/10" },
  DISMISSAL: { label: "Dismissal", cls: "text-rose-300 bg-rose-500/15" },
};

const statusMeta: Record<string, { label: string; cls: string; dot: string }> = {
  DRAFT: { label: "Draft", cls: "text-gray-300 bg-white/10", dot: "bg-gray-400" },
  SUBMITTED: { label: "Pending HR", cls: "text-indigo-300 bg-indigo-500/15", dot: "bg-indigo-400" },
  APPROVED: { label: "Approved", cls: "text-emerald-300 bg-emerald-500/10", dot: "bg-emerald-400" },
  CLOSED: { label: "Closed", cls: "text-gray-400 bg-white/5", dot: "bg-gray-500" },
  REJECTED: { label: "Rejected", cls: "text-rose-300 bg-rose-500/15", dot: "bg-rose-400" },
  RETURNED: { label: "Returned", cls: "text-amber-300 bg-amber-500/10", dot: "bg-amber-400" },
};

function getInitials(name: string) {
  const words = name.trim().split(" ");
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCases(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const total = cases.length;
  const pending = cases.filter((c) => c.status === "SUBMITTED").length;
  const approved = cases.filter((c) => c.status === "APPROVED").length;

  const stats = [
    { label: "Total cases", value: total, cls: "text-white" },
    { label: "Pending HR", value: pending, cls: "text-indigo-300" },
    { label: "Approved", value: approved, cls: "text-emerald-300" },
  ];

  return (
    <div className="max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        Case log
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Cases</h1>
      <p className="text-gray-400 mt-1">Every incident you've filed, newest first.</p>

      {/* summary strip */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
          >
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : cases.length === 0 ? (
        <div className="mt-6 border border-dashed border-white/15 rounded-2xl p-10 text-center text-gray-400">
          No cases yet. File one from “Create incident”.
        </div>
      ) : (
        <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-white/[0.02]">
                <th className="px-5 py-3.5 font-semibold">Employee</th>
                <th className="px-5 py-3.5 font-semibold">Violation</th>
                <th className="px-5 py-3.5 font-semibold">Offense</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Filed</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const action = actionMeta[c.action] ?? {
                  label: c.action,
                  cls: "text-gray-300 bg-white/10",
                };
                const status = statusMeta[c.status] ?? {
                  label: c.status,
                  cls: "text-gray-300 bg-white/10",
                  dot: "bg-gray-400",
                };
                return (
                  <tr
                    key={c.id}
                    className="border-t border-white/10 hover:bg-white/[0.02] align-top"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                          {getInitials(c.employee_name)}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {c.employee_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-gray-200">
                        {c.violation_name}
                      </div>
                      {c.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2" title={c.description}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-grid place-items-center min-w-[1.75rem] h-7 px-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold">
                        #{c.offense_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${action.cls}`}
                      >
                        {action.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${status.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
