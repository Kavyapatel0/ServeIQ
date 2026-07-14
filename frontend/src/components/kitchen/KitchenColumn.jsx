import { motion, AnimatePresence } from "framer-motion";
import { KitchenCard } from "./KitchenCard";
import { ChefHat } from "lucide-react";
import { cn } from "@/utils/cn";

const COLUMN_CONFIG = {
    PENDING: {
        label: "Pending",
        emoji: "⏳",
        headerClass: "bg-gray-100 border-gray-200 text-gray-700",
        dotClass: "bg-gray-400",
        ring: "ring-gray-200",
    },
    PREPARING: {
        label: "Preparing",
        emoji: "🍳",
        headerClass: "bg-amber-50 border-amber-200 text-amber-700",
        dotClass: "bg-amber-400",
        ring: "ring-amber-100",
    },
    READY: {
        label: "Ready",
        emoji: "✅",
        headerClass: "bg-green-50 border-green-200 text-green-700",
        dotClass: "bg-green-400",
        ring: "ring-green-100",
    },
    SERVED: {
        label: "Served",
        emoji: "🍽",
        headerClass: "bg-blue-50 border-blue-200 text-blue-700",
        dotClass: "bg-blue-400",
        ring: "ring-blue-100",
    },
};

export function KitchenColumn({ status, orders, onStatusChange, onOpenDetails, updatingId, canAdvance }) {
    const config = COLUMN_CONFIG[status];

    return (
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-gray-50/50">
            {/* Column Header */}
            <div className={cn("flex items-center gap-2.5 rounded-t-2xl border-b px-4 py-3", config.headerClass)}>
                <span className="text-lg">{config.emoji}</span>
                <h3 className="font-bold">{config.label}</h3>
                <span className={cn("ml-auto flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold text-white", config.dotClass)}>
                    {orders.length}
                </span>
            </div>

            {/* Cards */}
            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
                <AnimatePresence mode="popLayout">
                    {orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-32 flex-col items-center justify-center text-center text-text-secondary"
                        >
                            <ChefHat className="mb-2 h-8 w-8 opacity-20" />
                            <p className="text-xs font-medium">No orders</p>
                        </motion.div>
                    ) : (
                        orders.map((order) => (
                            <KitchenCard
                                key={order.id}
                                order={order}
                                onStatusChange={onStatusChange}
                                onOpenDetails={onOpenDetails}
                                loading={updatingId === order.id}
                                canAdvance={canAdvance}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}