export default function CaseCard({
  caseData,
  children,
}: {
  caseData: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-900">{caseData.employee_name}</p>
        <p className="text-sm text-gray-500">
          {caseData.violation_name} · Offense {caseData.offense_number} · {caseData.action.replaceAll("_", " ")}
        </p>
      </div>
      <div className="flex gap-3">{children}</div>
    </div>
  );
}