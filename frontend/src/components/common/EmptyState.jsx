import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-warm-300 bg-surface text-center",
        compact ? "px-4 py-10" : "px-8 py-16",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 ring-1 ring-warm-200">
          <Icon className="h-6 w-6 text-text-secondary" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
