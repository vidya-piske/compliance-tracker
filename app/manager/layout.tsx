import Sidebar from "@/app/components/Sidebar";
import { query } from "@/lib/db";

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const users = await query("SELECT name, title FROM users WHERE role = $1", ["manager"]);
  const user = users[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={[
          { label: "All cases", href: "/manager" },
          { label: "Action ladder", href: "/manager/ladder" },
        ]}
        userName={user.name}
        userTitle={user.title}
      />
      {children}
    </div>
  );
}