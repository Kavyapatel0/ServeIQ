import { Button } from "@/components/ui/button";

/**
 * "An empty screen is an invitation to act" — used whenever a table or
 * list has zero rows (no orders yet, no ingredients yet, etc.) instead
 * of a blank white rectangle.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg">
          <Icon className="h-6 w-6 text-text-secondary" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
