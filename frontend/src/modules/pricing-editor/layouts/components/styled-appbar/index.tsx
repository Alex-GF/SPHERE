export function StyledAppBar({ mode, children }: { mode: 'light' | 'dark'; children: React.ReactNode }) {
  return (
    <div className={`sticky top-0 z-40 ${mode === 'light' ? 'bg-slate-50' : 'bg-black'} shadow-sm`}>
      {children}
    </div>
  );
}
