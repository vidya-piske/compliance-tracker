import { useEffect, useState } from "react";
import { Check, Undo2 } from "lucide-react";

type Case = {
  id: number;
  employee_name: string;
  manager_name: string;
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
  APPROVED: { label: "Approved", cls: "text-emerald-300 bg-emerald-500/10", dot: "bg-emerald-400" },
  RETURNED: { label: "Returned", cls: "text-amber-300 bg-amber-500/10", dot: "bg-amber-400" },
  CLOSED: { label: "Closed", cls: "text-gray-400 bg-white/5", dot: "bg-gray-500" },
};

function getInitials(name: string) {
  const w = name.trim().split(" ");
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HRReview() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"pending" | "reviewed">("pending");

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCases(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function review(id: number, status: "APPROVED" | "RETURNED") {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not update the case");
        return;
      }
      // move it to the reviewed tab by updating its status in place
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = cases.filter((c) => c.status === "SUBMITTED");
  const reviewed = cases.filter((c) =>
    ["APPROVED", "RETURNED", "CLOSED"].includes(c.status),
  );
  const list = tab === "pending" ? pending : reviewed;

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      active
        ? "bg-white/10 text-white border border-white/15"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        HR · Review queue
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Cases to review</h1>
      <p className="text-gray-400 mt-1">
        Approve or return submitted cases, and look back at your decisions.
      </p>

      {/* tabs */}
      <div className="mt-6 flex gap-2">
        <button className={tabClass(tab === "pending")} onClick={() => setTab("pending")}>
          Pending ({pending.length})
        </button>
        <button className={tabClass(tab === "reviewed")} onClick={() => setTab("reviewed")}>
          Reviewed ({reviewed.length})
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : list.length === 0 ? (
        <div className="mt-6 border border-dashed border-white/15 rounded-2xl p-10 text-center text-gray-400">
          {tab === "pending"
            ? "🎉 All caught up — nothing pending review."
            : "No reviewed cases yet."}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((c) => {
            const action = actionMeta[c.action] ?? {
              label: c.action,
              cls: "text-gray-300 bg-white/10",
            };
            const status = statusMeta[c.status];
            const busy = busyId === c.id;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold">
                      {getInitials(c.employee_name)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {c.employee_name} · {c.violation_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Filed by {c.manager_name} · {formatDate(c.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-grid place-items-center min-w-[1.75rem] h-7 px-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold">
                      #{c.offense_number}
                    </span>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${action.cls}`}
                    >
                      {action.label}
                    </span>
                  </div>
                </div>

                {c.description && (
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                    {c.description}
                  </p>
                )}

                {tab === "pending" ? (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => review(c.id, "APPROVED")}
                      disabled={busy}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-500/25 transition disabled:opacity-60"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => review(c.id, "RETURNED")}
                      disabled={busy}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-sm font-semibold hover:bg-amber-500/25 transition disabled:opacity-60"
                    >
                      <Undo2 className="w-4 h-4" /> Return
                    </button>
                  </div>
                ) : (
                  status && (
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        Your decision: {status.label}
                      </span>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
