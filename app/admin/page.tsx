import { query } from "@/lib/db";

export default async function RulebookPage() {
  const violations = await query("SELECT id, name FROM violations ORDER BY id");
  const rules = await query(
    "SELECT violation_id, offense_number, action FROM rules",
  );

  // helper: find the action for a given violation + offense number
  function actionFor(violationId: number, offense: number) {
    const rule = rules.find(
      (r) => r.violation_id === violationId && r.offense_number === offense,
    );
    return rule ? rule.action.replaceAll("_", " ") : "—";
  }
  return (
    <main className="p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">
        System Administrator
      </p>
      <h1 className="text-3xl font-bold text-gray-900">Company rulebook</h1>
      <p className="text-gray-500 mb-8">
        Each violation maps to an action for offences 1 through 5.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-200">
              <th className="pb-3">Violation</th>
              <th className="pb-3">1st</th>
              <th className="pb-3">2nd</th>
              <th className="pb-3">3rd</th>
              <th className="pb-3">4th</th>
              <th className="pb-3">5th</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => (
              <tr key={v.id} className="border-b border-gray-100">
                <td className="py-3 font-medium text-gray-900">{v.name}</td>
                <td className="py-3 text-gray-600">{actionFor(v.id, 1)}</td>
                <td className="py-3 text-gray-600">{actionFor(v.id, 2)}</td>
                <td className="py-3 text-gray-600">{actionFor(v.id, 3)}</td>
                <td className="py-3 text-gray-600">{actionFor(v.id, 4)}</td>
                <td className="py-3 text-gray-600">{actionFor(v.id, 5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
