import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default:  "border-transparent bg-forest-600 text-white",
        brand:    "border-transparent bg-primary-100 text-primary-700",
        accent:   "border-transparent bg-accent-100 text-accent-700",
        success:  "border-transparent bg-success-bg text-success-text",
        danger:   "border-transparent bg-danger-bg text-danger-text",
        warning:  "border-transparent bg-warning-bg text-warning-text",
        info:     "border-transparent bg-info-bg text-info-text",
        outline:  "border-border text-text-secondary bg-transparent",
        warm:     "border-warm-300 bg-warm-100 text-warm-700",
        premium:  "border-accent-200 bg-accent-50 text-accent-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
