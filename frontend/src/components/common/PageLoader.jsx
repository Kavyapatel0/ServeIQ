import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

export function PageLoader({ label = "Loading ServeIQ…" }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-app-bg">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-card"
      >
        <UtensilsCrossed className="h-7 w-7 text-white" strokeWidth={2} />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-semibold text-text-primary">ServeIQ</p>
        <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
      </div>
      {/* Loading bar */}
      <div className="h-0.5 w-32 overflow-hidden rounded-full bg-warm-200">
        <motion.div
          className="h-full rounded-full bg-primary-500"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
