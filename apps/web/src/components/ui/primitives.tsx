'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  featuredDark?: boolean;
}

export function Card({ className, featuredDark, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-16 transition-colors duration-300 ease-smartedu',
        featuredDark
          ? 'border-transparent bg-brand-ink text-[#F8FAFC]'
          : 'border-[var(--se-border)] bg-[var(--se-bg-card)] text-[var(--se-text-primary)]',
        className,
      )}
      {...props}
    />
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'lg' | 'md' | 'sm' | 'xsm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const sizeClasses = {
      lg: 'button-lg px-16 py-12 min-h-[44px]',
      md: 'button-md px-12 py-8 min-h-[44px]',
      sm: 'button-sm px-12 py-8 min-h-[36px]',
      xsm: 'button-xsm px-8 py-4 min-h-[32px]',
    }[size];

    const variantClasses = {
      primary:
        'bg-brand-teal text-brand-ink hover:bg-brand-bright-teal border border-transparent',
      secondary:
        'bg-[var(--se-bg-elevated)] text-[var(--se-text-primary)] border border-[var(--se-border)] hover:bg-[var(--se-bg-hover)]',
      ghost:
        'bg-transparent text-[var(--se-text-secondary)] border border-transparent hover:bg-[var(--se-bg-hover)] hover:text-[var(--se-text-primary)]',
      danger:
        'bg-[var(--se-danger-bg)] text-[var(--se-danger-text)] border border-[var(--se-border)] hover:opacity-90',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-8 rounded-lg transition-[transform,opacity,background-color] duration-300 ease-smartedu active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:pointer-events-none disabled:opacity-50',
          sizeClasses,
          variantClasses,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)]',
    success: 'bg-[var(--se-success-bg)] text-[var(--se-success-text)]',
    warning: 'bg-[var(--se-warning-bg)] text-[var(--se-warning-text)]',
    danger: 'bg-[var(--se-danger-bg)] text-[var(--se-danger-text)]',
    info: 'bg-[var(--se-info-bg)] text-[var(--se-info-text)]',
  };

  return (
    <span
      className={cn(
        'caption-3 inline-flex items-center rounded-full px-12 py-4',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'body-6 w-full min-h-[44px] rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-16 py-8 text-[var(--se-text-primary)] placeholder:text-[var(--se-text-muted)] transition-colors duration-300 ease-smartedu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--se-bg-elevated)]',
        className,
      )}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-48 text-center">
      <div className="mb-12 flex h-48 w-48 items-center justify-center rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] text-brand-teal">
        {icon}
      </div>
      <h3 className="title-3 text-[var(--se-text-primary)]">{title}</h3>
      <p className="body-6 mt-4 max-w-[420px] text-[var(--se-text-secondary)]">{description}</p>
      {action ? <div className="mt-16">{action}</div> : null}
    </Card>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="body-6 rounded-xl border border-[var(--se-border)] bg-[var(--se-danger-bg)] px-16 py-12 text-[var(--se-danger-text)]"
    >
      {message}
    </div>
  );
}
