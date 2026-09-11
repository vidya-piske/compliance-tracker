import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Check, History } from "lucide-react";

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
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const VISIBLE = ["APPROVED", "ACKNOWLEDGED", "CLOSED"];

export default function MyCases() {
  const user = useSelector((s: any) => s.auth.user);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [viewing, setViewing] = useState<Case | null>(null);
  const [events, setEvents] = useState<
    { actor: string; message: string; created_at: string }[]
  >([]);
  const [eventsLoading, setEventsLoading] = useState(false);

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

  function openDetails(c: Case) {
    setViewing(c);
    setEvents([]);
    setEventsLoading(true);
    fetch(`/api/cases/${c.id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => setEvents(Array.isArray(d.events) ? d.events : []))
      .finally(() => setEventsLoading(false));
  }

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
      setViewing((v) => (v && v.id === id ? { ...v, status: "ACKNOWLEDGED" } : v));
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  const isAck = (s: string) => s === "ACKNOWLEDGED" || s === "CLOSED";

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        My record
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {user?.name ? `${user.name}'s cases` : "My cases"}
      </h1>
      <p className="text-gray-400 mt-1">
        Corrective actions on your record. Open one to see the details and
        acknowledge it.
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
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                  {isAck(c.status) ? (
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
                  <button
                    onClick={() => openDetails(c)}
                    className="flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200 transition"
                  >
                    <History className="w-4 h-4" /> View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewing(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#141426] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
              Case details
            </p>
            <h2 className="mt-1 text-xl font-bold">{viewing.violation_name}</h2>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-gray-500">Action taken</div>
                <div className="font-medium mt-0.5">
                  {actionMeta[viewing.action]?.label ?? viewing.action}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-gray-500">Offense number</div>
                <div className="font-medium mt-0.5">#{viewing.offense_number}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-gray-500">Issued by</div>
                <div className="font-medium mt-0.5">{viewing.manager_name}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium mt-0.5">
                  {formatDate(viewing.created_at)}
                </div>
              </div>
            </div>

            {viewing.description && (
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">What happened</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {viewing.description}
                </p>
              </div>
            )}

            <h3 className="text-sm font-semibold text-gray-300 mt-6 mb-3">
              History
            </h3>
            {eventsLoading ? (
              <p className="text-xs text-gray-500">Loading history…</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-gray-500">No history yet.</p>
            ) : (
              <div>
                {events.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      {i < events.length - 1 && (
                        <span className="flex-1 w-px bg-white/10 my-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="text-sm text-gray-200">{ev.message}</div>
                      <div className="text-xs text-gray-500">
                        {ev.actor} · {formatDateTime(ev.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              {!isAck(viewing.status) && (
                <button
                  onClick={() => acknowledge(viewing.id)}
                  disabled={busyId === viewing.id}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> Acknowledge
                </button>
              )}
              <button
                onClick={() => setViewing(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
