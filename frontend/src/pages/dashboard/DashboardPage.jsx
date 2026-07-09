import { DollarSign, ShoppingBag, ChefHat, Users } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Dashboard shell for Phase 1.
 *
 * The layout, spacing, and KPI card grid described in the design brief
 * ("Welcome Back, Priya / Revenue / Orders / Kitchen Queue...") are
 * built here now so every later phase has a home to plug real data
 * into. The numbers below are placeholders — Phase 2 replaces this
 * static block with live queries against /api/analytics, /api/orders,
 * /api/kitchen/dashboard, and /api/crm/dashboard.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Today's Revenue", value: "₹0", icon: DollarSign, accent: "brand" },
    { label: "Today's Orders", value: "0", icon: ShoppingBag, accent: "info" },
    { label: "Kitchen Queue", value: "0", icon: ChefHat, accent: "warning" },
    { label: "Customers Today", value: "0", icon: Users, accent: "success" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your restaurant today."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Wired up in Phase 2 with live analytics data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary">
              Revenue chart coming in Phase 2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kitchen Status</CardTitle>
            <CardDescription>Live queue counts arrive with Kitchen frontend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-secondary">
              Kitchen status coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
