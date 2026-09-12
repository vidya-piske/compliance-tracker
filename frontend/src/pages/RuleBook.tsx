import { useEffect, useState } from "react";

type Rule = {
  id: number;
  violation_id: number;
  violation_name: string;
  offense_number: number;
  action: string;
};

const actionMeta: Record<string, { label: string; tone: "low" | "mid" | "high" }> = {
  FIRST_WARNING: { label: "First warning", tone: "low" },
  FINAL_WRITTEN_WARNING: { label: "Final written warning", tone: "low" },
  SUSPENSION_3_DAYS: { label: "Suspension — 3 days", tone: "mid" },
  SUSPENSION_5_DAYS: { label: "Suspension — 5 days", tone: "mid" },
  DISMISSAL: { label: "Dismissal", tone: "high" },
};

const tones = {
  low: {
    node: "from-emerald-400 to-emerald-600",
    glow: "shadow-emerald-500/30",
    pill: "text-emerald-300 bg-emerald-500/10",
    label: "Low",
  },
  mid: {
    node: "from-amber-400 to-orange-600",
    glow: "shadow-amber-500/30",
    pill: "text-amber-300 bg-amber-500/10",
    label: "Medium",
  },
  high: {
    node: "from-rose-400 to-red-600",
    glow: "shadow-rose-500/40",
    pill: "text-rose-300 bg-rose-500/15",
    label: "High",
  },
};

export default function RuleBook() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rules", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRules(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const groups = new Map<string, Rule[]>();
  for (const r of rules) {
    if (!groups.has(r.violation_name)) groups.set(r.violation_name, []);
    groups.get(r.violation_name)!.push(r);
  }
  const violations = [...groups.entries()];

  return (
    <div className="relative max-w-5xl">
      <div className="pointer-events-none absolute -top-16 -left-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          Disciplinary policy
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Rule book</h1>
        <p className="text-gray-400 mt-1 max-w-2xl leading-relaxed">
          Each violation has its own escalation ladder — the offense count decides
          the action automatically, so outcomes stay consistent. More serious
          violations start higher up the ladder.
        </p>
      </div>

      {loading ? (
        <p className="relative mt-6 text-gray-400">Loading…</p>
      ) : violations.length === 0 ? (
        <p className="relative mt-6 text-gray-400">No rules configured.</p>
      ) : (
        <div className="relative mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {violations.map(([name, steps]) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold">{name}</h2>
                <span className="text-xs text-gray-500">{steps.length} steps</span>
              </div>

              {steps.map((r, i) => {
                const meta = actionMeta[r.action] ?? {
                  label: r.action,
                  tone: "low" as const,
                };
                const t = tones[meta.tone];
                const isLast = i === steps.length - 1;
                return (
                  <div key={r.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br ${t.node} text-white text-xs font-bold shadow-lg ${t.glow}`}
                      >
                        {r.offense_number}
                      </span>
                      {!isLast && <span className="flex-1 w-px my-1 bg-white/10" />}
                    </div>
                    <div className="flex-1 pb-4 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-gray-500">
                          Offense {r.offense_number}
                        </div>
                        <div className="text-sm font-medium">{meta.label}</div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${t.pill}`}
                      >
                        {t.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
