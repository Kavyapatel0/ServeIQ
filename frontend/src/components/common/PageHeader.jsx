import { cn } from "@/utils/cn";

/**
 * Every module page (POS, Kitchen, Inventory, CRM, Analytics, Admin)
 * starts with this so titles, breadcrumb-adjacent descriptions, and
 * primary actions line up identically everywhere in the app.
 */
export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
