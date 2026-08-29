import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'sage' | 'amber' | 'blue' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium font-sans whitespace-nowrap rounded-full transition-colors';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5'
  };

  const variantStyles = {
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200/80',
    sage: 'bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/20',
    amber: 'bg-[#F9F3EA] text-[#9A6B2F] border border-[#9A6B2F]/20',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200/80',
    outline: 'bg-transparent text-stone-600 border border-stone-300'
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
