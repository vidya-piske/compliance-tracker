import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Check } from "lucide-react";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const VISIBLE = ["APPROVED", "ACKNOWLEDGED", "CLOSED"];

export default function MyCases() {
  const user = useSelector((s: any) => s.auth.user);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cases", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setCases(
          (Array.isArray(data) ? data : []).filter((c: Case) =>
            VISIBLE.includes(c.status),
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function acknowledge(id: number) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "ACKNOWLEDGED" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not acknowledge the case");
        return;
      }
      setCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "ACKNOWLEDGED" } : c)),
      );
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        My record
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {user?.name ? `${user.name}'s cases` : "My cases"}
      </h1>
      <p className="text-gray-400 mt-1">
        Corrective actions on your record. Please acknowledge each one.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : cases.length === 0 ? (
        <div className="mt-6 border border-dashed border-white/15 rounded-2xl p-10 text-center text-gray-400">
          🎉 You have a clean record — no cases.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {cases.map((c) => {
            const action = actionMeta[c.action] ?? {
              label: c.action,
              cls: "text-gray-300 bg-white/10",
            };
            const acknowledged =
              c.status === "ACKNOWLEDGED" || c.status === "CLOSED";
            const busy = busyId === c.id;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{c.violation_name}</div>
                    <div className="text-xs text-gray-500">
                      Offense #{c.offense_number} · Issued by {c.manager_name} ·{" "}
                      {formatDate(c.created_at)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${action.cls}`}
                  >
                    {action.label}
                  </span>
                </div>

                {c.description && (
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                    {c.description}
                  </p>
                )}

                <div className="mt-4">
                  {acknowledged ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
                      <Check className="w-4 h-4" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledge(c.id)}
                      disabled={busy}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-60"
                    >
                      {busy && (
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      )}
                      <Check className="w-4 h-4" /> Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
