import type { ReactNode } from "react";

type Props = {
  loading?: boolean;
  children: ReactNode;
};

export default function SubmitButton({ loading, children }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}