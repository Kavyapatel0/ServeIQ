import { cn } from "@/utils/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-warm-200",
        className
      )}
      {...props}
    />
  );
}
