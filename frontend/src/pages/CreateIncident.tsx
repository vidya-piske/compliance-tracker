import { useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";

type Employee = { id: number; name: string; designation: string };
type Violation = { id: number; name: string };

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition";

const actionLabels: Record<string, string> = {
  FIRST_WARNING: "First warning",
  FINAL_WRITTEN_WARNING: "Final written warning",
  SUSPENSION_3_DAYS: "Suspension — 3 days",
  SUSPENSION_5_DAYS: "Suspension — 5 days",
  DISMISSAL: "Dismissal",
};

export default function CreateIncident() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [violationId, setViolationId] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<{
    offenseNumber: number;
    action: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/employees", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []));
    fetch("/api/violations", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setViolations(Array.isArray(data) ? data : []));
  }, []);

  // Live preview: recompute the offense # + action whenever the picks change.
  useEffect(() => {
    if (!employeeId || !violationId) {
      setPreview(null);
      return;
    }
    fetch(
      `/api/cases/preview?employeeId=${employeeId}&violationId=${violationId}`,
      { credentials: "include" },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPreview(data));
  }, [employeeId, violationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!employeeId || !violationId) {
      setError("Please select an employee and a violation.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: Number(employeeId),
          violationId: Number(violationId),
          incidentDate: incidentDate || null,
          description: description || null,
          status: "SUBMITTED",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create incident");
        return;
      }
      const label = actionLabels[data.action] ?? data.action;
      setSuccess(`Case filed — offense #${data.offenseNumber}: ${label}. Sent to HR for review.`);
      setEmployeeId("");
      setViolationId("");
      setIncidentDate("");
      setDescription("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        New case
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Create incident</h1>
      <p className="text-gray-400 mt-1">
        Report a violation — the rule book decides the action automatically.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 space-y-6"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Employee</label>
            <Dropdown
              value={employeeId}
              onChange={setEmployeeId}
              options={employees.map((e) => ({
                value: String(e.id),
                label: `${e.name} — ${e.designation}`,
              }))}
              placeholder="Select an employee"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Violation</label>
            <Dropdown
              value={violationId}
              onChange={setViolationId}
              options={violations.map((v) => ({ value: String(v.id), label: v.name }))}
              placeholder="Select a violation"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Incident date</label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What happened?"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
            {success}
          </p>
        )}

        {preview && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.08] p-4 flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-lg bg-indigo-500/20 text-indigo-200 font-bold">
              #{preview.offenseNumber}
            </span>
            <div className="text-sm">
              <div className="text-gray-300">
                This will be offense{" "}
                <b className="text-white">#{preview.offenseNumber}</b> for this rule
              </div>
              <div className="text-gray-400">
                Mandated action:{" "}
                <b className="text-indigo-200">
                  {actionLabels[preview.action] ?? preview.action}
                </b>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !employeeId || !violationId}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && (
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          )}
          {submitting ? "Filing…" : "File incident"}
        </button>
      </form>
    </div>
  );
}