import { Clock3, Flame, CheckCircle2, PackageCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

const CARDS = [
  { key: "pending", label: "Pending", icon: Clock3, accent: "text-gray-500 bg-gray-100" },
  { key: "preparing", label: "Preparing", icon: Flame, accent: "text-amber-600 bg-amber-50" },
  { key: "ready", label: "Ready", icon: CheckCircle2, accent: "text-green-600 bg-green-50" },
  { key: "served_today", label: "Served Today", icon: PackageCheck, accent: "text-blue-600 bg-blue-50" },
];

/** `data` is the payload from GET /api/kitchen/dashboard. */
export function KitchenStats({ data, status }) {
  const isLoading = status === "loading" || status === "idle";

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className="rounded-card border border-border bg-card p-4 card-shadow">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.accent)}>
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-text-secondary">{card.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-8" />
              ) : (
                <p className="text-xl font-bold text-text-primary">{data?.[card.key] ?? 0}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}