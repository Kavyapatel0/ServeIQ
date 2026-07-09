import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * "Errors don't apologize, and they are never vague about what happened."
 * Used wherever a query/fetch fails — pairs with a Retry action wired
 * to whatever refetch function the calling page already has.
 */
export function ErrorState({ message = "Something went wrong while loading this data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-text-primary">Couldn't load this</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
