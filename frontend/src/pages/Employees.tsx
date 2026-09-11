import { useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";
import { Pencil, Trash2 } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  designation: string;
  email: string | null;
};

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition";

const designations = [
  { value: "Intern", label: "Intern" },
  { value: "Employee", label: "Employee" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
];

function getInitials(name: string) {
  const words = name.trim().split(" ");
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/employees", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName("");
    setDesignation("");
    setEmail("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = JSON.stringify({ name, designation, email: email || null });
      if (editingId === null) {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not add employee");
          return;
        }
        setEmployees((prev) => [...prev, data]);
      } else {
        const res = await fetch(`/api/employees/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not update employee");
          return;
        }
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === editingId ? data : emp)),
        );
        setEditingId(null);
      }
      resetForm();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this employee?")) return;
    setError("");
    const res = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete employee");
      return;
    }
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }

  function startEdit(emp: Employee) {
    setEditingId(emp.id);
    setName(emp.name);
    setDesignation(emp.designation);
    setEmail(emp.email ?? "");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My team</h1>
          <p className="text-gray-400 mt-1">
            The employees you manage and file incidents for.
          </p>
        </div>
        <span className="shrink-0 text-sm text-gray-400 px-3 py-1 rounded-full border border-white/10 bg-white/5">
          {employees.length} {employees.length === 1 ? "member" : "members"}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/[0.04]"
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Employee name"
            className={`${inputClass} flex-1 min-w-[150px]`}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Login email (optional)"
            className={`${inputClass} flex-1 min-w-[150px]`}
          />
          <div className="flex-1 min-w-[150px]">
            <Dropdown
              value={designation}
              onChange={setDesignation}
              options={designations}
              placeholder="Select designation"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-60"
          >
            {saving && (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            )}
            {saving
              ? editingId
                ? "Updating…"
                : "Adding…"
              : editingId
                ? "Update"
                : "Add"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="shrink-0 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Add a login email so the employee can sign in (role “Employee”) and
          acknowledge cases about them.
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </form>

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : employees.length === 0 ? (
        <div className="mt-6 border border-dashed border-white/15 rounded-xl p-8 text-center text-gray-400">
          No employees yet. Add your first team member below.
        </div>
      ) : (
        <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-white/[0.02]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Designation</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t border-white/10 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                        {getInitials(emp.name)}
                      </span>
                      <div className="min-w-0">
                        <span className="font-medium block">{emp.name}</span>
                        {emp.email && (
                          <span className="text-xs text-gray-500 truncate block">
                            {emp.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/20">
                      {emp.designation}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(emp)}
                        className="w-8 h-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-400/40 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="w-8 h-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-rose-400 hover:border-rose-400/40 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
