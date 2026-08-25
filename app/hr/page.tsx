import { query } from "@/lib/db";
import Link from "next/link";
import CaseCard from "@/app/components/CaseCard";
import { acknowledgeCase } from "./actions";

export default async function EmployeePage() {
  const cases = await query(`
    SELECT cases.id, employees.name AS employee_name, violations.name AS violation_name,
           cases.offense_number, cases.action, cases.status
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    WHERE cases.status = 'APPROVED'
    ORDER BY cases.id DESC
  `);

  return (
    <main className="p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Employee</p>
      <h1 className="text-3xl font-bold text-gray-900">My notices</h1>
      <p className="text-gray-500 mb-6">Corrective actions issued to you. Please acknowledge each one.</p>
      <Link href="/" className="text-sm text-gray-500 mb-8 inline-block">← Switch role</Link>

      {cases.length === 0 ? (
        <p className="text-gray-400">You have no notices to acknowledge.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c}>
              <form action={acknowledgeCase}>
                <input type="hidden" name="caseId" value={c.id} />
                <button type="submit" className="bg-[#2D5BD6] text-white px-4 py-2 rounded-lg font-medium cursor-pointer">Acknowledge</button>
              </form>
            </CaseCard>
          ))}
        </div>
      )}
    </main>
  );
}