const rules = [
  {
    step: 1,
    action: "First warning",
    trigger: "1st offense",
    severity: "Low",
    description:
      "A documented verbal conversation. The employee is told the behavior was noticed and must not continue. No penalty yet — but it's now on record.",
  },
  {
    step: 2,
    action: "Final written warning",
    trigger: "2nd offense",
    severity: "Low",
    description:
      "A formal warning placed in the employee's file, making clear that the next offense will carry real consequences.",
  },
  {
    step: 3,
    action: "Suspension — 3 days",
    trigger: "3rd offense",
    severity: "Medium",
    description:
      "Three days off without pay. A tangible consequence signalling the pattern must stop now.",
  },
  {
    step: 4,
    action: "Suspension — 5 days",
    trigger: "4th offense",
    severity: "Medium",
    description:
      "Five days off without pay — the last step before termination is on the table.",
  },
  {
    step: 5,
    action: "Dismissal",
    trigger: "5th offense",
    severity: "High",
    description:
      "Termination of employment. Reserved for repeated violations after every earlier step has failed.",
  },
];

const tones: Record<
  string,
  { node: string; glow: string; bar: string; pill: string }
> = {
  Low: {
    node: "from-emerald-400 to-emerald-600",
    glow: "shadow-emerald-500/30",
    bar: "bg-emerald-400/70",
    pill: "text-emerald-300 bg-emerald-500/10",
  },
  Medium: {
    node: "from-amber-400 to-orange-600",
    glow: "shadow-amber-500/30",
    bar: "bg-amber-400/70",
    pill: "text-amber-300 bg-amber-500/10",
  },
  High: {
    node: "from-rose-400 to-red-600",
    glow: "shadow-rose-500/40",
    bar: "bg-rose-400/80",
    pill: "text-rose-300 bg-rose-500/15",
  },
};

export default function RuleBook() {
  return (
    <div className="relative max-w-3xl">
      <div className="pointer-events-none absolute -top-16 -left-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          Disciplinary policy
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-transparent">
          The escalation ladder
        </h1>
        <p className="mt-3 text-gray-400 max-w-2xl leading-relaxed">
          Every violation follows the same path. Each repeat offense of the same
          rule moves the employee one rung down — from a quiet word to
          dismissal. The offense count decides the action automatically, so
          outcomes stay consistent no matter who files the case.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <span>
            <b className="text-gray-300">5</b> steps
          </span>
          <span>
            <b className="text-gray-300">Verbal warning</b> →{" "}
            <b className="text-gray-300">Dismissal</b>
          </span>
          <span>Applied automatically by offense count</span>
        </div>
      </div>

      <div className="relative mt-12">
        {rules.map((rule, i) => {
          const tone = tones[rule.severity];
          const isLast = i === rules.length - 1;
          return (
            <div key={rule.step} className="group flex gap-5">
              <div className="flex flex-col items-center">
                <span
                  className={`w-11 h-11 shrink-0 grid place-items-center rounded-full bg-gradient-to-br ${tone.node} text-white font-bold shadow-lg ${tone.glow}`}
                >
                  {rule.step}
                </span>
                {!isLast && (
                  <span className="flex-1 w-px my-2 bg-gradient-to-b from-white/25 to-white/5" />
                )}
              </div>

              <div className="relative flex-1 mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5">
                <span className="pointer-events-none absolute -right-1 -top-8 text-[7rem] font-black leading-none text-white/[0.03] select-none">
                  {rule.step}
                </span>

                <span
                  className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${tone.bar}`}
                />

                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {rule.trigger}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {rule.action}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${tone.pill}`}
                  >
                    {rule.severity}
                  </span>
                </div>
                <p className="relative mt-3 text-sm text-gray-400 leading-relaxed max-w-xl">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
