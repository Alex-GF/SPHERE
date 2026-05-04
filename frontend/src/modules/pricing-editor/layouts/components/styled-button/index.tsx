import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type StyledButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    mode: 'light' | 'dark';
  }
>;

export function StyledButton({ mode, className = '', children, ...props }: StyledButtonProps) {
  const baseClasses =
    mode === 'light'
      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      : 'text-slate-100 hover:bg-slate-800 hover:text-white';

  return (
    <button
      type="button"
      className={`relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
