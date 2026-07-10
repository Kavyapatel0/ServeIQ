import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ChefHat, Boxes, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const FEATURES = [
  { icon: ChefHat,   label: "Real-time kitchen queue" },
  { icon: Boxes,     label: "Live inventory & purchase orders" },
  { icon: Users,     label: "Customer loyalty & CRM" },
  { icon: BarChart3, label: "Business intelligence dashboards" },
];

/**
 * Split-screen auth layout — redesigned left panel.
 *
 * What changed from the previous version:
 *   • LoginHeroArt (SVG line-drawing) removed entirely.
 *   • Background is now a real fine-dining restaurant photograph,
 *     fetched from Unsplash (free-to-use, no attribution required for
 *     display purposes) via a stable direct URL.
 *   • Three transparency layers sit on top of the photo, back to front:
 *       1. A dark navy base overlay  (opacity 0.55) — deepens the photo
 *          so the white text is always readable regardless of screen
 *          brightness.
 *       2. A bottom-to-top gradient (navy-950 → transparent) — anchors
 *          the motto section visually, mimicking the cinematic "title
 *          card" treatment common in premium restaurant branding.
 *       3. A left-to-right vignette (navy-900/60 → transparent) —
 *          keeps the left edge from feeling too bright.
 *   • Dot-grid texture retained at 0.04 opacity for the subtle depth
 *     effect from the original design.
 *
 * The right panel (form) is unchanged — same white/gray surface, same
 * max-w-sm centered form card.
 *
 * To swap the photo: replace the `HERO_PHOTO_URL` constant below with
 * any image URL. The three overlay layers will keep the text legible
 * regardless of how light or busy the new photo is.
 */

// High-resolution fine-dining restaurant interior — warm candlelight,
// white-tablecloth setting. Directly matches ServeIQ's target market.
const HERO_PHOTO_URL =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85&auto=format&fit=crop";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Brand / photo panel ─────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden lg:flex">

        {/* Layer 1: the restaurant photo */}
        <img
          src={HERO_PHOTO_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Layer 2a: solid dark navy overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-navy-950/60" />

        {/* Layer 2b: bottom-up gradient — most opaque at the bottom
            where the motto lives, fades out toward the top */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-900/70 to-transparent" />

        {/* Layer 2c: left vignette — subtle edge darkening */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/50 to-transparent" />

        {/* Layer 2d: dot-grid texture — kept for depth at low opacity */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Layer 3: content — z-10 to sit above all overlays */}
        <Logo variant="dark" className="relative z-10 p-10" />

        {/* Motto + feature list — bottom of the panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 p-10"
        >
          {/* Thin brand accent line above headline */}
          <div className="mb-5 h-1 w-12 rounded-full bg-brand-500" />

          <h2 className="max-w-sm text-3xl font-bold leading-snug tracking-tight text-white">
            The operating system for fine-dining restaurants.
          </h2>

          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
            One platform for orders, kitchen, inventory, customers, and revenue —
            built for the way real fine-dining floors actually run.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/75">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-brand-400" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          {/* Tagline badge */}
          <div className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-4 py-2 ring-1 ring-brand-500/30 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span className="text-xs font-medium text-brand-300">
              Designed exclusively for fine-dining operations
            </span>
          </div>
        </motion.div>

        <p className="relative z-10 px-10 pb-6 text-xs text-white/35">
          © {new Date().getFullYear()} ServeIQ. All rights reserved.
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-app-bg px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo visible only on mobile — hidden on lg+ since the
              photo panel already shows it */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="light" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}