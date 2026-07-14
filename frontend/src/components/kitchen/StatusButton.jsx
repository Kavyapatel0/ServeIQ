import { cn } from "@/utils/cn";

const TRANSITIONS = {
  PENDING: { label: "Start Preparing", next: "PREPARING", style: "bg-amber-500 hover:bg-amber-600 text-white" },
  PREPARING: { label: "Mark Ready", next: "READY", style: "bg-green-500 hover:bg-green-600 text-white" },
  READY: { label: "Mark Served", next: "SERVED", style: "bg-blue-500 hover:bg-blue-600 text-white" },
  SERVED: { label: "Completed", next: null, style: "bg-gray-100 text-gray-400 cursor-not-allowed" },
};

/**
 * `canAdvance` reflects RBAC, not just workflow state: a Waiter can
 * only ever fire the READY→SERVED transition (kitchen.view is enough
 * for that one), while PENDING→PREPARING and PREPARING→READY require
 * kitchen.update_status (Chef/Branch Manager/Super Admin). KitchenPage
 * computes this per-card so the button never lets someone attempt a
 * transition the backend would reject with a 403.
 */
export function StatusButton({ currentStatus, onUpdate, loading, canAdvance = true }) {
  const config = TRANSITIONS[currentStatus] ?? TRANSITIONS.PENDING;
  const disabled = !config.next || loading || !canAdvance;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (config.next) onUpdate(config.next);
      }}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl py-2 text-xs font-bold transition-all",
        config.style,
        disabled && "opacity-60 cursor-not-allowed"
      )}
      title={!canAdvance && config.next ? "You don't have permission to update this order." : undefined}
    >
      {loading ? "Updating..." : !canAdvance && config.next ? "View only" : config.label}
    </button>
  );
}