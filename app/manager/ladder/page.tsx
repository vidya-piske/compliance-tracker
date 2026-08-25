import { query } from "@/lib/db";

export default async function LadderPage() {
  // The 5 rungs for Late Attendance (violation_id = 1)
  const rules = await query(
    "SELECT id, offense_number, action FROM rules WHERE violation_id = $1 ORDER BY offense_number",
    ["1"],
  );

  const currentLevel = 3; // hardcoded for now — the employee is on level 3

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Shift Manager</p>
      <h1 className="text-3xl font-bold text-gray-900">Corrective action ladder</h1>
      <p className="text-gray-500 mb-8">Where this employee sits and why.</p>

      {/* Dark header panel */}
      <div className="bg-[#16202E] text-white rounded-xl p-8 mb-8">
        <p className="text-sm text-gray-400 uppercase tracking-wide">Rahul · Late Attendance</p>
        <h2 className="text-3xl font-bold mt-1">
          Level {currentLevel} — {rules[currentLevel - 1]?.action.replaceAll("_", " ")}
        </h2>
        <p className="text-gray-300 mt-2">
          This is offense #{currentLevel} for Rahul, so the rulebook sets level {currentLevel}.
        </p>
      </div>

      {/* The 5 rung cards */}
      <div className="grid grid-cols-5 gap-4">
        {rules.map((rule) => {
          const isCurrent = rule.offense_number === currentLevel;
          const isServed = rule.offense_number < currentLevel;
          return (
            <div
              key={rule.id}
              className={`rounded-xl p-4 border ${isCurrent ? "bg-[#16202E] text-white border-[#16202E]" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold ${isCurrent ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                  {rule.offense_number}
                </span>
                <span className={`text-xs font-medium ${isServed ? "text-green-600" : isCurrent ? "text-white" : "text-gray-400"}`}>
                  {isServed ? "SERVED" : isCurrent ? "CURRENT" : "IF REPEATED"}
                </span>
              </div>
              <p className="font-semibold">{rule.action.replaceAll("_", " ")}</p>
              <p className={`text-xs mt-2 ${isCurrent ? "text-gray-300" : "text-gray-400"}`}>
                Offense #{rule.offense_number}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}