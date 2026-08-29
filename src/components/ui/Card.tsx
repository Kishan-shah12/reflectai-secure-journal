import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'muted' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-[#D6D1C7]/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]',
    elevated: 'bg-white border border-[#D6D1C7]/80 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)]',
    muted: 'bg-[#F4F1EA] border border-[#D6D1C7]/50',
    outline: 'bg-transparent border border-[#D6D1C7]',
    interactive: 'bg-white border border-[#D6D1C7]/70 shadow-2xs hover:border-[#2D6A4F]/40 hover:shadow-sm cursor-pointer'
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 sm:p-10'
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
