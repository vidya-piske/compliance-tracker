import Link from "next/link";

// PART 1 — DEFINE the RoleCard component (once, at the top)
function RoleCard({
  initials,
  title,
  description,
  href,
}: {
  initials: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 mb-3 hover:border-[#2D5BD6] hover:bg-gray-50 transition"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
       <span className="text-gray-400 flex justify-end">→</span>  
    </Link>
  );
}

// PART 2 — the page, which USES RoleCard 4 times
export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* LEFT panel — dark */}
      <div className="w-1/2 bg-[#16202E] text-white p-12 flex flex-col justify-center">
        {/* Main content — centered vertically */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Corrective Action Tracker</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            Log incidents once. The rulebook determines the action, HR reviews
            it, and every step stays on the record.
          </p>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5BD6]"></span>
              Consistent outcomes across every department
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5BD6]"></span>
              Full audit trail from draft to closure
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5BD6]"></span>
              Employees acknowledge in writing
            </li>
          </ul>
        </div>
      </div>

      {/* Right side — the role picker */}
      <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-1">Sign in</h2>
        <p className="text-gray-500 mb-6">
          Choose the workspace that matches your role.
        </p>

        <RoleCard
          initials="MG"
          title="Manager"
          description="Log incidents and track your team's cases"
          href="/manager"
        />
        <RoleCard
          initials="HR"
          title="HR"
          description="Review, approve, and close cases"
          href="/hr"
        />
        <RoleCard
          initials="EM"
          title="Employee"
          description="View and acknowledge notices"
          href="/employee"
        />
        <RoleCard
          initials="AD"
          title="Admin"
          description="Maintain the company rulebook"
          href="/admin"
        />
      </div>
    </div>
  );
}
