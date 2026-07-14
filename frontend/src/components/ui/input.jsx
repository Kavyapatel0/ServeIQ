import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-input border border-border bg-surface px-3.5 py-2 text-sm",
        "text-text-primary placeholder:text-text-disabled",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 focus-visible:bg-warm-50",
        "hover:border-warm-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-100",
        "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
