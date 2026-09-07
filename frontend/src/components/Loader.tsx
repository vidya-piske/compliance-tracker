export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#0a0a14] text-white">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-gray-400 text-sm tracking-wide">Loading…</p>
    </div>
  );
}
