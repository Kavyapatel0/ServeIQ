import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-navy-900 text-white",
        brand: "border-transparent bg-brand-50 text-brand-700",
        success: "border-transparent bg-success-bg text-green-700",
        danger: "border-transparent bg-danger-bg text-red-700",
        warning: "border-transparent bg-warning-bg text-amber-700",
        info: "border-transparent bg-info-bg text-blue-700",
        outline: "border-border text-text-secondary bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
