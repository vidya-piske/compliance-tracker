import Sidebar from "@/app/components/Sidebar";
import { query } from "@/lib/db";

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const users = await query("SELECT name, title FROM users WHERE role = $1", ["hr"]);
  const user = users[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={[
          { label: "All cases", href: "/hr" },
          { label: "Action ladder", href: "/ladder" },
        ]}
        userName={user.name}
        userTitle={user.title}
      />
      {children}
    </div>
  );
}