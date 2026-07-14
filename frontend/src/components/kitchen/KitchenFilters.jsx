import { Search, X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/utils/cn";

const STATUS_OPTIONS = [
  { value: "ALL",       label: "All statuses"      },
  { value: "PENDING",   label: "Pending"            },
  { value: "PREPARING", label: "Preparing"          },
  { value: "READY",     label: "Ready"              },
  { value: "SERVED",    label: "Served"             },
];

const SORT_OPTIONS = [
  { value: "oldest", label: "Oldest first (FIFO)" },
  { value: "newest", label: "Newest first"         },
];

export function KitchenFilters({ search, onSearchChange, statusFilter, onStatusChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search order # or table…"
          className={cn(
            "h-10 w-full rounded-input border border-warm-200 bg-surface pl-9 pr-8 text-sm",
            "text-text-primary placeholder:text-text-disabled",
            "transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400",
            "hover:border-warm-400"
          )}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="sm:w-44 bg-surface">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="sm:w-52 bg-surface">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
