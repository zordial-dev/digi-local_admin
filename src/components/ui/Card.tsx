import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('font-serif text-xl font-semibold leading-tight tracking-normal text-[var(--foreground)]', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs font-mono-meta text-[var(--muted-foreground)] tracking-wider', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0 border-t border-[var(--border)] mt-4', className)} {...props}>
    {children}
  </div>
);
