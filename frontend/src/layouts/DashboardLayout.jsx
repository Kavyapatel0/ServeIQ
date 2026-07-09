import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { setSidebarCollapsed } from "@/redux/slices/uiSlice";

/**
 * The permanent shell: sidebar + navbar + main content + footer.
 * Every protected route renders inside here via <Outlet />, so
 * POS/Kitchen/Inventory/CRM/Analytics/Admin pages only ever need to
 * build their own content — layout, auth, and responsiveness are
 * already solved once, here.
 */
export function DashboardLayout() {
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Auto-collapse on tablets/mobile so the sidebar never eats the
  // content area on a narrow viewport; desktop keeps the user's choice.
  useEffect(() => {
    if (!isDesktop) dispatch(setSidebarCollapsed(true));
  }, [isDesktop, dispatch]);

  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 px-8 py-8">
          <Breadcrumbs />
          <div className="mt-3">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
