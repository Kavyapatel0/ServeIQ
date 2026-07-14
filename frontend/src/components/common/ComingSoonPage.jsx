import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/utils/cn";

export function ComingSoonPage({ title, description, icon: Icon, phaseNote }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-card border border-dashed border-warm-300 bg-surface px-8 py-20 text-center"
      >
        {/* Decorative ring */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warm-100 ring-1 ring-warm-200">
            {Icon && <Icon className="h-9 w-9 text-primary-400" strokeWidth={1.5} />}
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 ring-2 ring-surface">
            <Sparkles className="h-3 w-3 text-accent-500" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-text-primary">This module is coming soon</h3>
        {phaseNote && (
          <p className="mt-2 max-w-sm text-sm text-text-secondary leading-relaxed">
            {phaseNote}
          </p>
        )}

        {/* Progress indicator */}
        <div className="mt-8 flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2 ring-1 ring-warm-200">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
          <span className="text-xs font-medium text-text-secondary">In development</span>
        </div>
      </motion.div>
    </div>
  );
}
