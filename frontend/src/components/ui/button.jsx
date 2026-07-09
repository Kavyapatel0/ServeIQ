import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium " +
    "transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 " +
    "active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white shadow-soft hover:bg-brand-600 focus-visible:outline-brand-500",
        secondary:
          "bg-navy-900 text-white shadow-soft hover:bg-navy-800",
        outline:
          "border border-border bg-white text-text-primary hover:bg-app-bg",
        ghost: "text-text-primary hover:bg-app-bg",
        danger: "bg-danger text-white shadow-soft hover:bg-red-600",
        link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
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
