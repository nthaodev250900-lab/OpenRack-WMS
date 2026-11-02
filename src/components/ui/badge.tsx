import { clsx } from 'clsx';
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium',
        {
          'bg-success-soft text-success': tone === 'success',
          'bg-warning-soft text-warning': tone === 'warning',
          'bg-danger-soft text-danger': tone === 'danger',
          'bg-info-soft text-info': tone === 'info',
          'bg-muted text-muted-foreground': tone === 'neutral',
        },
      )}
    >
      {children}
    </span>
  );
}
