export default function IslandButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#0f172a] px-6 py-3 text-sm font-medium text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1e293b] active:scale-[0.98]"
    >
      <span>{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[13px] text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-1 group-hover:scale-105">
        ↗
      </span>
    </button>
  );
}
