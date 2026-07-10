import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * The permanent shell: sidebar + navbar + main content + footer.
 * Every protected route renders inside here via <Outlet />, so
 * POS/Kitchen/Inventory/CRM/Analytics/Admin pages only ever need to
 * build their own content — layout, auth, and responsiveness are
 * already solved once, here.
 *
 * Responsiveness is handled entirely inside <Sidebar />: on desktop
 * it's a sticky, collapsible rail that participates in this flex
 * layout; on mobile/tablet it renders as an off-canvas drawer that's
 * unmounted (taking up no space) until the Navbar's hamburger opens it.
 */
export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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