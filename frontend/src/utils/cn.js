import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving Tailwind conflicts (e.g. "p-2 p-4" -> "p-4").
 * Standard shadcn/ui utility — every ui/ component uses this.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
