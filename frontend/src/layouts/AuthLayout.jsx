import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=90&auto=format&fit=crop";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left: Hero panel ─────────────────────────────────── */}
      <div className="relative hidden w-[52%] flex-col overflow-hidden lg:flex xl:w-[55%]">
        {/* Background photo */}
        <img
          src={HERO_PHOTO}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Overlay layers */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(15,26,17,0.68)" }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 p-10"
        >
          <Logo variant="dark" />
        </motion.div>

        <div className="flex-1" />

        {/* Bottom: Single powerful tagline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
          className="relative z-10 p-10 pb-14"
        >
          {/* Accent line */}
          <div className="mb-6 h-[3px] w-12 rounded-full" style={{ background: "linear-gradient(90deg,#c46a2d,#e8a96d)" }} />

          <h1 className="max-w-lg text-[2.6rem] font-bold leading-[1.12] tracking-tight text-white">
            Elevating Fine Dining<br />
            <span style={{
              background: "linear-gradient(135deg,#e8a96d 0%,#c46a2d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Operations.
            </span>
          </h1>

          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
            Smart intelligence for exceptional dining — manage orders, kitchen, inventory and revenue in one unified platform.
          </p>

          {/* Trust badge */}
          <div className="mt-10 inline-flex items-center gap-2.5 rounded-full px-4 py-2 ring-1 ring-white/15"
            style={{ background: "rgba(255,253,249,0.07)", backdropFilter: "blur(8px)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[12px] font-medium text-white/65">
              Trusted by premium fine-dining restaurants
            </span>
          </div>
        </motion.div>

        <p className="relative z-10 px-10 pb-5 text-[11px] text-white/22">
          © {new Date().getFullYear()} ServeIQ. All rights reserved.
        </p>
      </div>

      {/* ── Right: Form panel ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-app-bg px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex justify-center lg:hidden">
          <Logo variant="light" />
        </div>
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
        <p className="mt-10 text-center text-[11px] text-text-disabled lg:hidden">
          © {new Date().getFullYear()} ServeIQ
        </p>
      </div>
    </div>
  );
}
