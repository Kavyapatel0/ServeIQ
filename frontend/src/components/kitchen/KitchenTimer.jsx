import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";

function getElapsedMinutes(createdAt) {
    if (!createdAt) return 0;
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function timerColor(minutes) {
    if (minutes < 10) return "text-green-600";
    if (minutes < 20) return "text-amber-500";
    return "text-red-500";
}

export function KitchenTimer({ createdAt, status }) {
    const [minutes, setMinutes] = useState(getElapsedMinutes(createdAt));

    useEffect(() => {
        if (status === "SERVED") return; // Stop ticking for completed orders
        const id = setInterval(() => setMinutes(getElapsedMinutes(createdAt)), 30000);
        return () => clearInterval(id);
    }, [createdAt, status]);

    return (
        <div className={cn("flex items-center gap-1 text-xs font-bold tabular-nums", timerColor(minutes))}>
            <Clock className="h-3.5 w-3.5" />
            <span>{minutes}m</span>
        </div>
    );
}
