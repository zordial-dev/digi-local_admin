import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'forest' | 'gold' | 'secondary' | 'outline' | 'destructive' | 'violet' | 'cyan' | 'warning';
  children: React.ReactNode;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  showDot = false,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-sans font-medium select-none border';

  const variantStyles = {
    default: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    forest: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    gold: 'bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/20',
    warning: 'bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/20',
    violet: 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20',
    cyan: 'bg-[#06B6D4]/10 text-[#0891B2] border-[#06B6D4]/20',
    secondary: 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]',
    outline: 'bg-white text-[#64748B] border-[#E2E8F0]',
    destructive: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  };

  const dotColorStyles = {
    default: 'bg-[#10B981]',
    forest: 'bg-[#10B981]',
    gold: 'bg-[#F59E0B]',
    warning: 'bg-[#F59E0B]',
    violet: 'bg-[#4F46E5]',
    cyan: 'bg-[#06B6D4]',
    secondary: 'bg-[#64748B]',
    outline: 'bg-[#64748B]',
    destructive: 'bg-[#EF4444]',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColorStyles[variant])} />
      )}
      {children}
    </span>
  );
};
