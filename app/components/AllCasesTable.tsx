import { query } from "@/lib/db";
import Link from "next/link";
import StatusBadge from "@/app/components/StatusBadge";

export default async function AllCasesTable({
  roleLabel,
  caseHrefBase,
}: {
  roleLabel: string;
  caseHrefBase?: string;
}) {
  const cases = await query(`
    SELECT cases.id, employees.name AS employee_name, violations.name AS violation_name,
           cases.offense_number, cases.action, cases.status
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    ORDER BY cases.id DESC
  `);
  const stats = await query(`
    SELECT COUNT(*) FILTER (WHERE status='SUBMITTED') AS pending,
           COUNT(*) FILTER (WHERE status='APPROVED') AS approved,
           COUNT(*) FILTER (WHERE status='CLOSED') AS closed,
           COUNT(*) FILTER (WHERE offense_number>=4) AS high_level
    FROM cases
  `);
  const s = stats[0];

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">{roleLabel}</p>
      <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
      <p className="text-gray-500">Every open and closed corrective action.</p>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Pending review</p><p className="text-3xl font-bold text-gray-900 mt-2">{s.pending}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Approved</p><p className="text-3xl font-bold text-gray-900 mt-2">{s.approved}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">Closed</p><p className="text-3xl font-bold text-gray-900 mt-2">{s.closed}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-sm text-gray-500">At level 4 or 5</p><p className="text-3xl font-bold text-gray-900 mt-2">{s.high_level}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl mt-8 p-6">
        <h2 className="font-bold text-lg mb-4">All cases</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-200">
              <th className="pb-3 pr-6">Employee</th><th className="pb-3 pr-6">Violation</th><th className="pb-3 pr-6">Offense</th><th className="pb-3 pr-6">Action</th><th className="pb-3 pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-3 pr-6 font-medium">
                  {caseHrefBase ? (
                    <Link href={`${caseHrefBase}/${c.id}`} className="text-[#2D5BD6] hover:underline">{c.employee_name}</Link>
                  ) : (
                    c.employee_name
                  )}
                </td>
                <td className="py-3 pr-6 text-gray-600">{c.violation_name}</td>
                <td className="py-3 pr-6 text-gray-600">{c.offense_number}</td>
                <td className="py-3 pr-6 text-gray-600">{c.action.replaceAll("_", " ")}</td>
                <td className="py-3 pr-6"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}