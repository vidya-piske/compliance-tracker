import Link from "next/link";

export default function Sidebar({
  navItems,
  userName,
  userTitle,
}: {
  navItems: { label: string; href: string }[];
  userName: string;
  userTitle: string;
}) {
  return (
   <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen sticky top-0">
      <h2 className="font-bold text-lg mb-8">Corrective Action Tracker</h2>

      <nav className="flex flex-col gap-1 text-sm">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="mb-3">
          <p className="font-medium text-sm text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{userTitle}</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Switch role</Link>
      </div>
    </aside>
  );
}