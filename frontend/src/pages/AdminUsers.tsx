import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string | null; role: string };

const roleCls: Record<string, string> = {
  admin: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20",
  hr: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  manager: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  employee: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
};

function getInitials(name: string) {
  const w = (name || "").trim().split(" ");
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        Admin
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <span className="shrink-0 text-sm text-gray-400 px-3 py-1 rounded-full border border-white/10 bg-white/5">
          {users.length} total
        </span>
      </div>
      <p className="text-gray-400 mt-1">Everyone with a login, across all roles.</p>

      {loading ? (
        <p className="mt-6 text-gray-400">Loading…</p>
      ) : users.length === 0 ? (
        <p className="mt-6 text-gray-400">No users.</p>
      ) : (
        <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-white/[0.02]">
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold">
                        {getInitials(u.name)}
                      </span>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400">{u.email ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full border capitalize ${
                        roleCls[u.role] ?? "text-gray-300 bg-white/10 border-white/10"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
