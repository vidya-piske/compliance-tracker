import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Dropdown from "../components/Dropdown";

type Rule = {
  id: number;
  violation_id: number;
  violation_name: string;
  offense_number: number;
  action: string;
};
type Violation = { id: number; name: string };

const actionOptions = [
  { value: "FIRST_WARNING", label: "First warning" },
  { value: "FINAL_WRITTEN_WARNING", label: "Final written warning" },
  { value: "SUSPENSION_3_DAYS", label: "Suspension — 3 days" },
  { value: "SUSPENSION_5_DAYS", label: "Suspension — 5 days" },
  { value: "DISMISSAL", label: "Dismissal" },
];
const actionLabel = (a: string) =>
  actionOptions.find((o) => o.value === a)?.label ?? a;

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition";

export default function AdminRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const [violationId, setViolationId] = useState("");
  const [offenseNumber, setOffenseNumber] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rules", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
    fetch("/api/violations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setViolations(Array.isArray(d) ? d : []));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!violationId || !offenseNumber || !action) {
      setError("Please fill in every field.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          violationId: Number(violationId),
          offenseNumber: Number(offenseNumber),
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not add rule");
        return;
      }
      const vname =
        violations.find((v) => String(v.id) === violationId)?.name ?? "";
      setRules((prev) => [...prev, { ...data, violation_name: vname }]);
      setViolationId("");
      setOffenseNumber("");
      setAction("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this rule?")) return;
    const res = await fetch(`/api/rules/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete rule");
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  const groups = new Map<string, Rule[]>();
  for (const r of [...rules].sort(
    (a, b) =>
      a.violation_id - b.violation_id || a.offense_number - b.offense_number,
  )) {
    if (!groups.has(r.violation_name)) groups.set(r.violation_name, []);
    groups.get(r.violation_name)!.push(r);
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        Admin
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Manage rules</h1>
      <p className="text-gray-400 mt-1">
        The escalation ladders the engine uses to decide actions.
      </p>

      <form
        onSubmit={handleAdd}
        className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/[0.04]"
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <Dropdown
              value={violationId}
              onChange={setViolationId}
              options={violations.map((v) => ({ value: String(v.id), label: v.name }))}
              placeholder="Violation"
            />
          </div>
          <input
            type="number"
            min={1}
            value={offenseNumber}
            onChange={(e) => setOffenseNumber(e.target.value)}
            placeholder="Offense #"
            className={`${inputClass} w-28 shrink-0 [color-scheme:dark]`}
          />
          <div className="flex-1 min-w-[150px]">
            <Dropdown
              value={action}
              onChange={setAction}
              options={actionOptions}
              placeholder="Action"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add rule"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </form>

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {[...groups.entries()].map(([name, steps]) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold mb-3">{name}</h2>
              <div className="space-y-2">
                {steps.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-2 border-t border-white/10 first:border-t-0"
                  >
                    <span className="w-7 h-7 shrink-0 grid place-items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold">
                      {r.offense_number}
                    </span>
                    <span className="flex-1 text-sm">{actionLabel(r.action)}</span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-rose-400 hover:border-rose-400/40 transition"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
