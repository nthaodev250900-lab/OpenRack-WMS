export function PageHeading({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      {' '}
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold tracking-[.18em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
