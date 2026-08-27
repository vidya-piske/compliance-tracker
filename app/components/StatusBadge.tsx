export default function StatusBadge({ status }: { status: string }) {
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
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>{status.replaceAll("_", " ")}</span>;
}