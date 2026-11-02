import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('panel', className)} {...props} />;
}
export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
