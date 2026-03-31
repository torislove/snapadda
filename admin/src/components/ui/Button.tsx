import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'violet' | 'cyan' | 'rose' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const widthClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      {...props}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      {children}
    </button>
  );
};
