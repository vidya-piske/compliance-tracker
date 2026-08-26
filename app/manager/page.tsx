import Link from "next/link";
import { query } from "@/lib/db";

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    SUBMITTED: "bg-amber-100 text-amber-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    EMPLOYEE_NOTIFIED: "bg-purple-100 text-purple-700",
    ACTION_IN_PROGRESS: "bg-teal-100 text-teal-700",
    COMPLETED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-700",
  };
  const style = styles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function ManagerDashboard() {
  const cases = await query(`
    SELECT cases.id,
           employees.name AS employee_name,
           employees.department,
           violations.name AS violation_name,
           cases.offense_number,
           cases.action,
           cases.status
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    ORDER BY cases.id DESC
  `);

  const stats = await query(`
  SELECT
    COUNT(*) FILTER (WHERE status = 'SUBMITTED')     AS pending,
    COUNT(*) FILTER (WHERE status = 'APPROVED')      AS approved,
    COUNT(*) FILTER (WHERE status = 'CLOSED')        AS closed,
    COUNT(*) FILTER (WHERE offense_number >= 4)      AS high_level
  FROM cases
`);
  const s = stats[0];

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      {/* Header row: title + New incident button */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            Shift Manager
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500">
            Every open and closed corrective action.
          </p>
        </div>
        <Link
          href="/manager/new"
          className="bg-[#2D5BD6] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          New incident
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Pending review"
          value={s.pending}
          note="awaiting HR review"
        />
        <StatCard
          label="Approved"
          value={s.approved}
          note="awaiting completion"
        />
        <StatCard label="Closed" value={s.closed} note="fully resolved" />
        <StatCard
          label="At level 4 or 5"
          value={s.high_level}
          note="escalation review"
        />
      </div>

      {/* Cases table */}
      <div className="bg-white border border-gray-200 rounded-xl mt-8 p-6">
        <h2 className="font-bold text-lg mb-4">Cases you logged</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-200">
              <th className="pb-3">Employee</th>
              <th className="pb-3">Violation</th>
              <th className="pb-3">Offense</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Status</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-3 font-medium">
                  <Link
                    href={`/case/${c.id}`}
                    className="text-[#2D5BD6] hover:underline"
                  >
                    {c.employee_name}
                  </Link>
                </td>
                <td className="py-3 text-gray-600">{c.violation_name}</td>
                <td className="py-3 text-gray-600">{c.offense_number}</td>
                <td className="py-3 text-gray-600">
                  {c.action.replaceAll("_", " ")}
                </td>
                <td className="py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
