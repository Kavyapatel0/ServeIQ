import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function ErrorState({ message, onRetry, className, compact = false }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 text-center",
      compact ? "py-8" : "py-12",
      className
    )}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-bg ring-1 ring-danger/20">
        <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">Something went wrong</p>
        <p className="mt-0.5 text-xs text-text-secondary max-w-xs leading-relaxed">
          {message || "Unable to load data. Please try again."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1 gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
