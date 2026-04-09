import React from 'react';

type StyledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  mode?: 'light' | 'dark';
};

export function StyledButton({ mode = 'light', className = '', children, ...props }: StyledButtonProps) {
  const colorClass = mode === 'light' ? 'text-sphere-primary-700 hover:text-sphere-primary-800' : 'text-sphere-primary-100 hover:text-sphere-primary-500';

  return (
    <button
      type="button"
      className={`relative rounded-md px-3 py-2 font-black transition-all duration-300 hover:bg-[rgba(202,240,248,0.4)] ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
