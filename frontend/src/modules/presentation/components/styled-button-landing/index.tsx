import React from 'react';

type StyledButtonLandingProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export function StyledButtonLanding({
  startIcon,
  endIcon,
  className = '',
  children,
  ...props
}: StyledButtonLandingProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-sphere-primary-300 px-5 py-2 text-center transition-colors duration-500 hover:bg-sphere-primary-500 hover:text-white ${className}`}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
