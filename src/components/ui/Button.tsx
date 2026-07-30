import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold' | 'gradient' | 'ink' | 'mint' | 'indigo' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-[10px] font-medium font-body transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer select-none';

    const variantStyles = {
      default:
        'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs font-semibold',
      indigo:
        'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs font-semibold',
      mint:
        'bg-[#10B981] hover:bg-[#059669] text-white font-semibold shadow-xs',
      gradient:
        'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs font-semibold',
      gold:
        'bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold shadow-xs',
      ink:
        'bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold shadow-xs',
      secondary:
        'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] shadow-xs font-medium',
      outline:
        'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] shadow-xs font-medium',
      ghost:
        'hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]',
      destructive:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold shadow-xs',
      success:
        'bg-[#10B981] hover:bg-[#059669] text-white font-semibold shadow-xs',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 text-sm justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
