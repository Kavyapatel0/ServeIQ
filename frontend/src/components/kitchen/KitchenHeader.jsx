import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff, ChefHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function KitchenHeader({ socketConnected, onRefresh, refreshing }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-100 pb-5">
      {/* Left: title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-soft">
          <ChefHat className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-text-primary">
            Kitchen Dashboard
          </h1>
          <p className="text-xs text-text-secondary">
            {timeStr} · {dateStr}
          </p>
        </div>
      </div>

      {/* Right: status + refresh */}
      <div className="flex items-center gap-3">
        <span className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
          socketConnected
            ? "bg-success-bg text-success-text ring-success/20"
            : "bg-warning-bg text-warning-text ring-warning/20"
        )}>
          {socketConnected
            ? <Wifi className="h-3.5 w-3.5" strokeWidth={2} />
            : <WifiOff className="h-3.5 w-3.5" strokeWidth={2} />}
          {socketConnected ? "Live" : "Reconnecting…"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
