import { query } from "@/lib/db";
import IncidentForm from "./IncidentForm";

export default async function NewIncidentPage() {
  const employees = await query("SELECT id, name, department FROM employees ORDER BY name");
  const violations = await query("SELECT id, name FROM violations ORDER BY name");

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Shift Manager</p>
      <h1 className="text-3xl font-bold text-gray-900">Log an incident</h1>
      <p className="text-gray-500 mb-8">
        The rulebook sets the action automatically once you pick a violation.
      </p>

      <IncidentForm employees={employees} violations={violations} />
    </main>
  );
}