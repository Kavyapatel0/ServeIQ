import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { cn } from "@/utils/cn";

const STAGES = [
  { key: "pending",     label: "Pending",     color: "#d39b2c", bg: "#fdf5e0", text: "#8a640f" },
  { key: "preparing",   label: "Preparing",   color: "#3a6fa8", bg: "#eef3fb", text: "#1e4a7a" },
  { key: "ready",       label: "Ready",       color: "#4c7a4b", bg: "#eef6ee", text: "#2d5c2c" },
  { key: "served_today",label: "Served Today",color: "#355c4b", bg: "#f0f6f3", text: "#1e3529" },
];

export function KitchenStatusCard({ data, status, error, onRetry }) {
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const max = data ? Math.max(1, ...STAGES.map((s) => data[s.key] || 0)) : 1;

  return (
    <Card className="hover:card-shadow-elevated transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Kitchen Status</CardTitle>
        <CardDescription>Live order queue right now</CardDescription>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <ErrorState message={error || "Couldn't load kitchen status."} onRetry={onRetry} compact />
        ) : isLoading ? (
          <WidgetSkeleton rows={4} className="h-9" />
        ) : (
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const count = data?.[stage.key] || 0;
              const pct   = Math.round((count / max) * 100);
              return (
                <div key={stage.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {stage.label}
                    </span>
                    <span
                      className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold"
                      style={{ backgroundColor: stage.bg, color: stage.text }}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-warm-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
