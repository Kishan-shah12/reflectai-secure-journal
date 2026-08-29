import React, { ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'default' | 'ghost' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  label,
  type = 'button',
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'w-9 h-9 sm:w-8 sm:h-8 p-1.5 min-w-[36px] min-h-[36px]',
    md: 'w-11 h-11 sm:w-10 sm:h-10 p-2 min-w-[44px] min-h-[44px]',
    lg: 'w-12 h-12 p-3 min-w-[48px] min-h-[48px]'
  };

  const variantStyles = {
    default: 'bg-stone-900 text-stone-50 hover:bg-stone-800',
    ghost: 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
    outline: 'border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300',
    subtle: 'bg-stone-100 text-stone-700 hover:bg-stone-200'
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
