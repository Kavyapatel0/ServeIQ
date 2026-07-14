import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function KitchenHeader({ socketConnected, onRefresh, refreshing }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Kitchen Dashboard</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
            socketConnected ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          )}
        >
          {socketConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {socketConnected ? "Live" : "Reconnecting…"}
        </span>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}