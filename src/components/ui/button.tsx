import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
export function buttonClass(variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') {
  return clsx(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold soft-transition disabled:opacity-50',
    {
      'bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] hover:text-[var(--primary-hover-foreground)]':
        variant === 'primary',
      'border border-border bg-card text-card-foreground hover:bg-muted': variant === 'secondary',
      'text-muted-foreground hover:bg-muted': variant === 'ghost',
      'bg-danger-soft text-danger hover:opacity-80': variant === 'danger',
    },
  );
}
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return <button className={clsx(buttonClass(variant), className)} {...props} />;
}
