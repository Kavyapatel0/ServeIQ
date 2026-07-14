import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";

const FULL_SCREEN_ROUTES = ["/pos", "/kitchen"];

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -4 },
};

export function DashboardLayout() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <AnimatePresence mode="wait" initial={false}>
          {isFullScreen ? (
            <main key="fullscreen" className="flex-1 overflow-hidden">
              <Outlet />
            </main>
          ) : (
            <main key="padded" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <motion.div
                key={location.pathname}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Breadcrumbs />
                <div className="mt-3">
                  <Outlet />
                </div>
              </motion.div>
            </main>
          )}
        </AnimatePresence>

        {!isFullScreen && <Footer />}
      </div>
    </div>
  );
}
