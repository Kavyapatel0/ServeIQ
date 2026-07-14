import { cn } from "@/utils/cn";

export function PageHeader({ title, description, actions, className, eyebrow }) {
  return (
    <div className={cn(
      "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
      className
    )}>
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary-500">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
}
