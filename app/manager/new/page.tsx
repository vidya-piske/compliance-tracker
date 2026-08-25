import { query } from "@/lib/db";
import IncidentForm from "./IncidentForm";

export default async function NewIncidentPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft: draftId } = await searchParams;

  const employees = await query("SELECT id, name, department FROM employees ORDER BY name");
  const violations = await query("SELECT id, name FROM violations ORDER BY name");

  // If a draft id is in the URL, fetch that draft
  let draft = null;
  if (draftId) {
    const rows = await query(
      "SELECT id, employee_id, violation_id, TO_CHAR(incident_date, 'YYYY-MM-DD') AS incident_date, description FROM cases WHERE id = $1",
      [draftId],
    );
    draft = rows[0] ?? null;
  }

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Shift Manager</p>
      <h1 className="text-3xl font-bold text-gray-900">Log an incident</h1>
      <p className="text-gray-500 mb-8">The rulebook sets the action automatically once you pick a violation.</p>

      <IncidentForm employees={employees} violations={violations} draft={draft} />
    </main>
  );
}