import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50 font-sans shadow-2xs',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            {rightIcon}
          </div>
        )}

        {error && <span className="font-sans text-[12px] text-[#EF4444] font-medium mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
