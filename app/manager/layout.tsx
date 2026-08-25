import Link from "next/link";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR — shows on every manager page */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="font-bold text-lg mb-8">Corrective Action Tracker</h2>

        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/manager" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            My cases
          </Link>
          <Link href="/manager/new" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            New incident
          </Link>
          <Link href="/manager/ladder" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Action ladder
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Switch role</Link>
        </div>
      </aside>

      {/* Each page's content goes here */}
      {children}
    </div>
  );
}