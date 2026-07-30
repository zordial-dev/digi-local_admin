import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'gold' | 'forest' | 'success' | 'warning' | 'destructive' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono-meta tracking-wider font-semibold transition-colors focus:outline-none';

  const variants = {
    default: 'border border-[var(--ink)] bg-[var(--ink)] text-[var(--ink-foreground)]',
    secondary:
      'border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)]',
    outline: 'text-[var(--foreground)] border border-[var(--border)]',
    gold: 'border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]',
    forest: 'border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]',
    success:
      'border border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
    warning:
      'border border-amber-600/30 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400',
    destructive:
      'border border-red-600/30 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-400',
    info: 'border border-blue-600/30 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
