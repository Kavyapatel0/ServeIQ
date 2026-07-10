import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS } from "@/constants/navigation";
import { usePermission } from "@/hooks/usePermission";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  toggleSidebar,
  closeMobileSidebar,
  selectSidebarCollapsed,
  selectMobileSidebarOpen,
} from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";

/**
 * Dark navy sidebar (#0F172A scale) — the enterprise anchor of the
 * design brief, deliberately not white, so cards read as bright
 * surfaces floating on a calm, serious frame.
 *
 * Nav items self-filter by permission: NAV_ITEMS carries a
 * `permission` key per item, and anything the current role can't
 * access simply never renders — no role-name branching here at all.
 *
 * Responsive behavior:
 *   - Desktop (>=1024px): sticky, part of the flex layout, collapses
 *     to an icon-only 72px rail via the button at the bottom.
 *   - Mobile/tablet: off-canvas drawer, opened by the hamburger button
 *     in the Navbar, closed via the backdrop, the X button, or picking
 *     a nav item.
 */
export function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectSidebarCollapsed);
  const mobileOpen = useSelector(selectMobileSidebarOpen);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { can } = usePermission();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));
  const closeOnMobile = () => {
    if (!isDesktop) dispatch(closeMobileSidebar());
  };

  const navList = (isCollapsed) => (
    <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={closeOnMobile}
          className={({ isActive }) =>
            cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-500/10 text-white"
                : "text-navy-400 hover:bg-white/5 hover:text-white"
            )
          }
          title={isCollapsed ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-500" />
              )}
              <item.icon
                className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-400")}
                strokeWidth={2}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  // ── Mobile: off-canvas drawer, unmounted entirely when closed ──────────
  if (!isDesktop) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm"
              onClick={() => dispatch(closeMobileSidebar())}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 shadow-elevated"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Logo variant="dark" collapsed={false} />
                <button
                  onClick={() => dispatch(closeMobileSidebar())}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {navList(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Desktop: sticky, collapsible rail ───────────────────────────────────
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-navy-900 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <Logo variant="dark" collapsed={collapsed} />
      </div>

      {navList(collapsed)}

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-navy-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}