import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ink' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
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
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium font-body transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer select-none';

    const variants = {
      default:
        'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 shadow-xs border border-[var(--primary)] hover:border-[var(--gold)]',
      ink:
        'bg-[var(--ink)] text-[var(--ink-foreground)] hover:brightness-125 shadow-xs border border-[var(--ink)] hover:border-[var(--gold)]',
      secondary:
        'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)] border border-transparent',
      outline:
        'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]',
      destructive:
        'bg-red-800 text-white hover:bg-red-900 border border-red-800 shadow-xs',
      ghost:
        'bg-transparent text-[var(--foreground)] hover:text-[var(--gold)] hover:bg-[var(--secondary)]',
      link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto font-normal hover:text-[var(--gold)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 font-mono-meta tracking-wider',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 text-sm justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
