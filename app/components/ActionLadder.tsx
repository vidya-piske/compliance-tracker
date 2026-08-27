import { query } from "@/lib/db";

export default async function ActionLadder() {
  // The ladder reflects the most recent case (real employee, violation, level)
  const caseRows = await query(`
    SELECT cases.violation_id, cases.offense_number,
           employees.name AS employee_name, violations.name AS violation_name
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    ORDER BY cases.id DESC
    LIMIT 1
  `);
  const c = caseRows[0];

  if (!c) return <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">No cases yet.</main>;

  const rules = await query(
    "SELECT id, offense_number, action FROM rules WHERE violation_id = $1 ORDER BY offense_number",
    [c.violation_id],
  );
  const currentLevel = c.offense_number;

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Corrective action ladder</p>
      <h1 className="text-3xl font-bold text-gray-900">Corrective action ladder</h1>
      <p className="text-gray-500 mb-8">Where this employee sits and why.</p>

      <div className="bg-[#16202E] text-white rounded-xl p-8 mb-8">
        <p className="text-sm text-gray-400 uppercase tracking-wide">{c.employee_name} · {c.violation_name}</p>
        <h2 className="text-3xl font-bold mt-1">
          Level {currentLevel} — {rules[currentLevel - 1]?.action.replaceAll("_", " ")}
        </h2>
        <p className="text-gray-300 mt-2">
          This is offense #{currentLevel} for {c.employee_name}, so the rulebook sets level {currentLevel}.
        </p>
      </div>

      <div className="flex gap-4">
        {rules.map((rule) => {
          const isCurrent = rule.offense_number === currentLevel;
          const isServed = rule.offense_number < currentLevel;
          return (
            <div key={rule.id} className={`flex-1 rounded-xl p-4 border ${isCurrent ? "bg-[#16202E] text-white border-[#16202E]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold ${isCurrent ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                  {rule.offense_number}
                </span>
                <span className={`text-xs font-medium ${isServed ? "text-green-600" : isCurrent ? "text-white" : "text-gray-400"}`}>
                  {isServed ? "SERVED" : isCurrent ? "CURRENT" : "IF REPEATED"}
                </span>
              </div>
              <p className="font-semibold">{rule.action.replaceAll("_", " ")}</p>
              <p className={`text-xs mt-2 ${isCurrent ? "text-gray-300" : "text-gray-400"}`}>Offense #{rule.offense_number}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}