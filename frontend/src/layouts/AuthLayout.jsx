import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ChefHat, Boxes, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LoginHeroArt } from "@/components/common/LoginHeroArt";

const FEATURES = [
  { icon: ChefHat, label: "Real-time kitchen queue" },
  { icon: Boxes, label: "Live inventory & purchase orders" },
  { icon: Users, label: "Customer loyalty & CRM" },
  { icon: BarChart3, label: "Business intelligence dashboards" },
];

/**
 * Split-screen auth layout: brand story on the navy panel, the actual
 * form (Login today, future Forgot Password etc.) rendered via
 * <Outlet /> on the right. Mirrors how Stripe/Linear present login —
 * one clear job per side, no distractions.
 *
 * The hero panel is layered, back to front:
 *   1. Solid navy base (bg-navy-900)
 *   2. LoginHeroArt — the fine-dining line illustration + ambient glow
 *   3. A translucent gradient wash on top of the art, so the motto
 *      and feature list stay legible regardless of how busy the art
 *      underneath gets — this is the "transparency" layer.
 *   4. Actual content (logo, motto, features, footer) at z-10.
 */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
        {/* Layer 2: illustration, positioned to bleed off the right/bottom edge */}
        <LoginHeroArt className="pointer-events-none absolute -bottom-24 -right-24 h-[640px] w-[640px]" />

        {/* Layer 3: translucent gradient wash for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-900/80 to-navy-900/50" />

        {/* Faint dot-grid texture, kept from the original design for depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Layer 4: content */}
        <Logo variant="dark" className="relative z-10" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            The operating system for fine-dining restaurants.
          </h2>
          <p className="mt-4 max-w-md text-navy-200">
            One platform for orders, kitchen, inventory, customers, and revenue —
            built for the way real fine-dining floors actually run.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-navy-200">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-brand-400" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative z-10 text-xs text-navy-400">
          © {new Date().getFullYear()} ServeIQ. Designed exclusively for fine-dining operations.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-app-bg px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="light" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}