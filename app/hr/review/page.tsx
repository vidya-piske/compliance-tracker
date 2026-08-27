import { query } from "@/lib/db";
import CaseCard from "@/app/components/CaseCard";
import { approveCase, rejectCase } from "@/app/hr/actions";

export default async function HRReviewPage() {
  const cases = await query(`
    SELECT cases.id, employees.name AS employee_name, violations.name AS violation_name,
           cases.offense_number, cases.action, cases.status
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    WHERE cases.status = 'SUBMITTED'
    ORDER BY cases.id DESC
  `);

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">HR Business Partner</p>
      <h1 className="text-3xl font-bold text-gray-900">Review queue</h1>
      <p className="text-gray-500 mb-8">Approve or reject cases submitted by managers.</p>

      {cases.length === 0 ? (
        <p className="text-gray-400">No cases waiting for review.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c}>
              <form action={approveCase}>
                <input type="hidden" name="caseId" value={c.id} />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer">Approve</button>
              </form>
              <form action={rejectCase}>
                <input type="hidden" name="caseId" value={c.id} />
                <button type="submit" className="border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium cursor-pointer">Reject</button>
              </form>
            </CaseCard>
          ))}
        </div>
      )}
    </main>
  );
}