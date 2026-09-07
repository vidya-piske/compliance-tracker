import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] p-4 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 min-h-[560px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden lg:flex flex-col justify-center items-center text-left p-14 bg-gradient-to-br from-indigo-600/25 to-fuchsia-600/20 border-r border-white/10">
          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-transparent">
              Fair discipline, fully documented.
            </h2>

            <p className="text-gray-300/80 leading-relaxed">
              When someone breaks a rule, the outcome shouldn't depend on who's handling it. Every
              case follows the same process, from first report to closure:
            </p>

            <ul className="space-y-6 text-gray-200">
              <li className="flex items-center justify-start gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                Consistent outcomes from one clear rulebook
              </li>
              <li className="flex items-center justify-start gap-3">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0" />
                HR review on every case
              </li>
              <li className="flex items-center justify-start gap-3">
                <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                A complete, defensible audit trail
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center p-14">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-400 mt-2 mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
