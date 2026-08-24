import { query } from "@/lib/db";
import IncidentForm from "./IncidentForm";


export default async function NewIncidentPage() {
  const employees = await query(
    "SELECT id, name, department FROM employees ORDER BY name",
  );
  const violations = await query(
    "SELECT id, name FROM violations ORDER BY name",
  );

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Shift Manager</p>
      <h1 className="text-3xl font-bold text-gray-900">Log an incident</h1>
      <p className="text-gray-500 mb-8">
        The rulebook sets the action automatically once you pick a violation.
      </p>

      {/* ↓↓↓ the two-column block goes HERE, inside main ↓↓↓ */}
      <div className="grid grid-cols-2 gap-6 max-w-5xl">
        {/* LEFT — the form */}
       <IncidentForm employees={employees} violations={violations} />

        {/* RIGHT — recommended action (static for now) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recommended action</h3>
            <span className="text-xs text-gray-400">AUTO · ATT-01</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-semibold text-sm">L3</div>
            <div>
              <p className="font-bold text-lg">Suspension 1</p>
              <p className="text-gray-500 text-sm">3 working days, unpaid. Return-to-work meeting required.</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4 bg-gray-50 rounded-lg p-3">
            This is the 3rd recorded late attendance within the policy window, so the rulebook sets level 3: suspension 1.
          </p>
        </div>
      </div>
    </main>
  );
}