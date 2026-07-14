import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const TRANSITIONS = {
  PENDING: {
    label: "Start Preparing",
    next:  "PREPARING",
    style: "bg-warning text-white hover:opacity-90",
  },
  PREPARING: {
    label: "Mark Ready",
    next:  "READY",
    style: "bg-success text-white hover:opacity-90",
  },
  READY: {
    label: "Mark Served",
    next:  "SERVED",
    style: "bg-primary-500 text-white hover:bg-primary-600",
  },
  SERVED: {
    label: "Completed",
    next:   null,
    style: "bg-warm-100 text-warm-400 cursor-not-allowed",
  },
};

export function StatusButton({ currentStatus, onUpdate, loading, canAdvance = true }) {
  const config   = TRANSITIONS[currentStatus] ?? TRANSITIONS.PENDING;
  const disabled = !config.next || loading || !canAdvance;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (config.next && !disabled) onUpdate(config.next);
      }}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl py-2 text-xs font-bold transition-all duration-150 active:scale-[0.98]",
        config.style,
        disabled && "opacity-60 cursor-not-allowed"
      )}
      title={!canAdvance && config.next ? "Insufficient permissions" : undefined}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating…
        </span>
      ) : !canAdvance && config.next ? (
        "View only"
      ) : (
        config.label
      )}
    </button>
  );
}
