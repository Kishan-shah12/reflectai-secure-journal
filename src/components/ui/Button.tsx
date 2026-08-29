import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px] sm:min-h-[34px]',
    md: 'px-4 py-2 text-sm rounded-xl gap-2 min-h-[44px] sm:min-h-[40px]',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5 min-h-[48px]'
  };

  const variantStyles = {
    primary: 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs border border-stone-800',
    secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200/80 border border-stone-200',
    outline: 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50/80 hover:border-stone-400 shadow-2xs',
    ghost: 'bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/70',
    sage: 'bg-[#2D6A4F] text-white hover:bg-[#245740] shadow-xs border border-[#245740]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs border border-red-700'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
