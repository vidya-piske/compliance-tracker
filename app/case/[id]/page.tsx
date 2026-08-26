import { query } from "@/lib/db";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const caseRows = await query(`
    SELECT cases.id, employees.name AS employee_name, employees.department,
           violations.name AS violation_name, cases.offense_number, cases.action,
           cases.status, TO_CHAR(cases.incident_date, 'DD Mon YYYY') AS incident_date,
           cases.description
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    WHERE cases.id = $1
  `, [id]);
  const c = caseRows[0];

  const events = await query(
    "SELECT actor, message, TO_CHAR(created_at, 'DD Mon YYYY') AS created_at FROM case_events WHERE case_id = $1 ORDER BY created_at",
    [id],
  );

  if (!c) return <main className="p-12">Case not found.</main>;

  return (
    <main className="p-12 bg-[#F5F6F8] min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">Case detail</h1>
      <p className="text-gray-500 mb-8">Full record and audit trail.</p>

      <div className="grid grid-cols-2 gap-6 max-w-5xl">
        {/* LEFT — case info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="font-mono text-sm text-[#2D5BD6]">CA-{c.id}</p>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div><p className="text-gray-400 uppercase text-xs">Employee</p><p className="font-medium">{c.employee_name}</p></div>
            <div><p className="text-gray-400 uppercase text-xs">Department</p><p className="font-medium">{c.department}</p></div>
            <div><p className="text-gray-400 uppercase text-xs">Violation</p><p className="font-medium">{c.violation_name}</p></div>
            <div><p className="text-gray-400 uppercase text-xs">Occurrence</p><p className="font-medium">{c.offense_number}</p></div>
            <div><p className="text-gray-400 uppercase text-xs">Date of incident</p><p className="font-medium">{c.incident_date ?? "—"}</p></div>
            <div><p className="text-gray-400 uppercase text-xs">Action</p><p className="font-medium">{c.action.replaceAll("_", " ")}</p></div>
          </div>
          {c.description && (
            <div className="mt-6">
              <p className="text-gray-400 uppercase text-xs">Manager&apos;s account</p>
              <p className="text-gray-600 mt-1">{c.description}</p>
            </div>
          )}
        </div>

        {/* RIGHT — audit trail */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Audit trail</h3>
          {events.length === 0 ? (
            <p className="text-gray-400 text-sm">No events yet.</p>
          ) : (
            <div className="space-y-4">
              {events.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0">{e.created_at}</span>
                  <div>
                    <p className="font-medium text-gray-900">{e.message}</p>
                    <p className="text-xs text-gray-500">{e.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}