import { query } from "@/lib/db";
import { acknowledgeCase } from "./action";

export default async function EmployeeNoticePage() {
  const caseRows = await query(`
    SELECT cases.id, cases.violation_id, employees.name AS employee_name,
           violations.name AS violation_name, cases.offense_number, cases.action,
           TO_CHAR(cases.incident_date, 'DD Mon YYYY') AS incident_date
    FROM cases
    JOIN employees ON cases.employee_id = employees.id
    JOIN violations ON cases.violation_id = violations.id
    WHERE cases.status = 'APPROVED'
    ORDER BY cases.id DESC
    LIMIT 1
  `);
  const c = caseRows[0];

  if (!c) {
    return (
      <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
        <p className="text-sm text-gray-400 uppercase tracking-wide">Warehouse Operative</p>
        <h1 className="text-3xl font-bold text-gray-900">Your notice</h1>
        <p className="text-gray-400 mt-4">You have no notices to acknowledge right now.</p>
      </main>
    );
  }

  const rules = await query(
    "SELECT id, offense_number, action FROM rules WHERE violation_id = $1 ORDER BY offense_number",
    [c.violation_id],
  );

  return (
    <main className="flex-1 p-12 bg-[#F5F6F8] min-h-screen">
      <p className="text-sm text-gray-400 uppercase tracking-wide">Warehouse Operative</p>
      <h1 className="text-3xl font-bold text-gray-900">Your notice</h1>
      <p className="text-gray-500 mb-8">Issued by HR · {c.incident_date ?? "recently"}</p>

      <div className="grid grid-cols-3 gap-6 max-w-5xl">
        {/* LEFT — the notice */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-8">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm mb-6">
            Action required — please acknowledge this notice.
          </div>

          <p className="font-mono text-sm text-[#2D5BD6]">CA-{c.id}</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Notice of Corrective Action</h2>

          <p className="text-gray-600 mt-4 leading-relaxed">
            {c.employee_name}, this notice concerns <strong>{c.violation_name}</strong>. As this is
            offense #{c.offense_number}, the company rulebook sets the corrective action below.
          </p>

          <div className="bg-[#16202E] text-white rounded-xl p-6 mt-6">
            <p className="text-sm text-gray-400 uppercase tracking-wide">Level {c.offense_number}</p>
            <p className="text-2xl font-bold mt-1">{c.action.replaceAll("_", " ")}</p>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Acknowledging confirms you have read and understood this notice. It does not mean you
            agree with it — you may add a response.
          </p>

          <div className="flex gap-3 mt-4">
            <form action={acknowledgeCase}>
              <input type="hidden" name="caseId" value={c.id} />
              <button type="submit" className="bg-[#2D5BD6] text-white px-5 py-2.5 rounded-lg font-medium cursor-pointer">Acknowledge notice</button>
            </form>
            <button className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg font-medium">Add a response</button>
          </div>
        </div>

        {/* RIGHT — mini ladder */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Where this sits on the ladder</h3>
          <div className="space-y-2">
            {rules.map((rule) => {
              const isHere = rule.offense_number === c.offense_number;
              const isServed = rule.offense_number < c.offense_number;
              return (
                <div key={rule.id} className={`rounded-lg px-3 py-2 text-sm flex items-center justify-between ${isHere ? "bg-[#16202E] text-white" : "bg-gray-50 text-gray-600"}`}>
                  <span>{rule.offense_number}. {rule.action.replaceAll("_", " ")}</span>
                  <span className={`text-xs ${isServed ? "text-green-600" : isHere ? "text-white" : "text-gray-400"}`}>
                    {isServed ? "Served" : isHere ? "You are here" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}