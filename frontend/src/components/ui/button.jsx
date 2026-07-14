import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium " +
  "transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white rounded-button shadow-soft " +
          "hover:bg-primary-600 focus-visible:ring-primary-500 " +
          "hover:shadow-card",
        secondary:
          "bg-forest-600 text-white rounded-button shadow-soft " +
          "hover:bg-forest-700 focus-visible:ring-forest-600",
        accent:
          "bg-accent-500 text-white rounded-button shadow-soft " +
          "hover:bg-accent-600 focus-visible:ring-accent-500",
        outline:
          "border border-border bg-surface text-text-primary rounded-button " +
          "hover:bg-warm-200 hover:border-warm-400 focus-visible:ring-primary-500",
        ghost:
          "text-text-primary rounded-button " +
          "hover:bg-warm-200 focus-visible:ring-primary-500",
        danger:
          "bg-danger text-white rounded-button shadow-soft " +
          "hover:bg-red-700 focus-visible:ring-danger",
        link:
          "text-primary-500 underline-offset-4 hover:underline p-0 h-auto focus-visible:ring-primary-500",
        subtle:
          "bg-primary-50 text-primary-700 rounded-button " +
          "hover:bg-primary-100 focus-visible:ring-primary-500",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
