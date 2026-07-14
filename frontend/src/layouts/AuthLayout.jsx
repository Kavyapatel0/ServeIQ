import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, BarChart3, Users, Package, Award } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=90&auto=format&fit=crop";

const FEATURES = [
  { icon: ChefHat,   label: "Real-time kitchen queue & order management" },
  { icon: Package,   label: "Live inventory tracking & purchase orders" },
  { icon: Users,     label: "Customer loyalty & CRM intelligence" },
  { icon: BarChart3, label: "Executive business intelligence dashboards" },
  { icon: Award,     label: "Designed exclusively for fine-dining operations" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">

      {/* ── Left: Hero panel ──────────────────────────────────────────── */}
      <div className="relative hidden w-[55%] flex-col overflow-hidden lg:flex xl:w-[58%]">

        {/* Background photo */}
        <img
          src={HERO_PHOTO}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Layer 1 — dark base for readability */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(21,36,25,0.72)" }} />

        {/* Layer 2 — bottom-up gradient (cinematic) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/95 via-forest-900/50 to-transparent" />

        {/* Layer 3 — left vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-900/40 to-transparent" />

        {/* Layer 4 — subtle warm dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fffdf9 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 p-10"
        >
          <Logo variant="dark" />
        </motion.div>

        {/* Middle: spacer */}
        <div className="flex-1" />

        {/* Bottom: Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative z-10 p-10 pb-12"
        >
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-[2px] w-8 rounded-full bg-accent-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-300">
              Enterprise Fine-Dining OS
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-md text-[2.4rem] font-bold leading-[1.15] tracking-tight text-white">
            The operating system<br />
            for fine-dining<br />
            <span className="text-gradient-accent" style={{
              background: "linear-gradient(135deg,#e8a96d,#c46a2d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              restaurants.
            </span>
          </h1>

          <p className="mt-5 max-w-[360px] text-[14.5px] leading-relaxed text-white/60">
            One unified platform for orders, kitchen, inventory, customers,
            and revenue — built the way real fine-dining floors actually run.
          </p>

          {/* Feature list */}
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 space-y-3"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <motion.li
                key={label}
                variants={itemVariants}
                className="flex items-center gap-3 text-[13px] text-white/70"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/15"
                  style={{ background: "rgba(255,253,249,0.08)" }}>
                  <Icon className="h-3.5 w-3.5 text-accent-300" strokeWidth={1.75} />
                </span>
                {label}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Copyright */}
        <p className="relative z-10 px-10 pb-5 text-[11px] text-white/25">
          © {new Date().getFullYear()} ServeIQ. All rights reserved.
        </p>
      </div>

      {/* ── Right: Form panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-app-bg px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex justify-center lg:hidden">
          <Logo variant="light" />
        </div>

        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>

        <p className="mt-10 text-center text-[11px] text-text-disabled lg:hidden">
          © {new Date().getFullYear()} ServeIQ · Restaurant Business Intelligence Platform
        </p>
      </div>
    </div>
  );
}
