import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Generic numbered pagination control.
 * Shows up to `windowSize` page buttons, with prev/next arrows.
 *
 * Props:
 *  page        — current page (1-based)
 *  totalPages  — total number of pages
 *  onPageChange — (newPage: number) => void
 *  className   — optional wrapper class
 */
export function Pagination({ page, totalPages, onPageChange, className }) {
  if (!totalPages || totalPages <= 1) return null;

  const WINDOW = 5;
  const half   = Math.floor(WINDOW / 2);
  let start    = Math.max(1, page - half);
  let end      = Math.min(totalPages, start + WINDOW - 1);
  if (end - start + 1 < WINDOW) start = Math.max(1, end - WINDOW + 1);

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const btn = (label, target, disabled, isActive) => (
    <button
      key={label}
      onClick={() => !disabled && onPageChange(target)}
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all",
        isActive
          ? "bg-primary-500 text-white shadow-soft"
          : disabled
          ? "cursor-not-allowed text-text-disabled"
          : "text-text-secondary hover:bg-warm-200 hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {btn(<ChevronLeft className="h-4 w-4" />, page - 1, page === 1, false)}
      {start > 1 && (
        <>
          {btn(1, 1, false, page === 1)}
          {start > 2 && <span className="px-1 text-xs text-text-disabled">…</span>}
        </>
      )}
      {pages.map(p => btn(p, p, false, p === page))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-xs text-text-disabled">…</span>}
          {btn(totalPages, totalPages, false, page === totalPages)}
        </>
      )}
      {btn(<ChevronRight className="h-4 w-4" />, page + 1, page === totalPages, false)}
    </div>
  );
}
