import { useEffect, useState } from "react";
import { Pencil, Eye, Trash2, Send } from "lucide-react";

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

const EDITABLE = ["DRAFT", "SUBMITTED", "RETURNED"];

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

  const [editing, setEditing] = useState<Case | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [pageError, setPageError] = useState("");

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

  function openCase(c: Case) {
    setEditing(c);
    setDraft(c.description ?? "");
    setEditError("");
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/cases/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Could not save changes");
        return;
      }
      setCases((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, description: draft } : c)),
      );
      setEditing(null);
    } catch {
      setEditError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResubmit(c: Case) {
    setPageError("");
    try {
      const res = await fetch(`/api/cases/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "SUBMITTED" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPageError(data.error || "Could not resubmit case");
        return;
      }
      setCases((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, status: "SUBMITTED" } : x)),
      );
    } catch {
      setPageError("Something went wrong. Try again.");
    }
  }

  async function handleDelete(c: Case) {
    if (!confirm(`Delete this case for ${c.employee_name}? This can't be undone.`)) return;
    setPageError("");
    try {
      const res = await fetch(`/api/cases/${c.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPageError(data.error || "Could not delete case");
        return;
      }
      setCases((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      setPageError("Something went wrong. Try again.");
    }
  }

  const canEditSelected = editing ? EDITABLE.includes(editing.status) : false;

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

      {pageError && (
        <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          {pageError}
        </p>
      )}

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
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
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
                const editable = EDITABLE.includes(c.status);
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
                        <div
                          className="text-xs text-gray-500 mt-0.5 line-clamp-2"
                          title={c.description}
                        >
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
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openCase(c)}
                          className="w-8 h-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-400/40 transition"
                          title={editable ? "Edit description" : "View details"}
                        >
                          {editable ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {c.status === "RETURNED" && (
                          <button
                            onClick={() => handleResubmit(c)}
                            className="w-8 h-8 grid place-items-center rounded-lg border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition"
                            title="Resubmit to HR"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {editable ? (
                          <button
                            onClick={() => handleDelete(c)}
                            className="w-8 h-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-rose-400 hover:border-rose-400/40 transition"
                            title="Delete case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span
                            className="w-8 h-8 grid place-items-center text-xs text-gray-600"
                            title="Locked — already reviewed"
                          >
                            🔒
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setEditing(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#141426] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">
              {canEditSelected ? "Edit case" : "Case details"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {editing.employee_name} · {editing.violation_name} · Offense #
              {editing.offense_number}
            </p>

            <label className="block text-sm text-gray-300 mt-4 mb-2">
              Description
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              readOnly={!canEditSelected}
              rows={5}
              placeholder="No description provided."
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition ${
                canEditSelected ? "" : "opacity-80 cursor-default"
              }`}
            />

            {!canEditSelected && (
              <p className="mt-2 text-xs text-gray-500">
                🔒 This case has been reviewed and is read-only.
              </p>
            )}

            {editError && (
              <p className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {editError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
              >
                {canEditSelected ? "Cancel" : "Close"}
              </button>
              {canEditSelected && (
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-sm font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-60"
                >
                  {saving && (
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  )}
                  {saving ? "Saving…" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
