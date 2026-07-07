import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui/Card";
import { dashboardApi } from "@/api/dashboard.api";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";

const RANGE_OPTIONS = [7, 14, 30] as const;

export const DashboardPage = () => {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(7);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });

  // Data values are untouched — only the visual presentation (icon chip colors) changed
  const cards = [
    {
      label: "Total Products",
      value: stats?.totalProducts,
      icon: Package,
      iconBg: "bg-brand/10",
      iconColor: "text-brand",
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers,
      icon: Users,
      iconBg: "bg-gold/15",
      iconColor: "text-gold-dark",
    },
    {
      label: "Total Sales",
      value: stats?.totalSales,
      icon: Receipt,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Low Stock Items",
      value: stats?.lowStockCount,
      icon: AlertTriangle,
      iconBg: "bg-danger/10",
      iconColor: "text-danger",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white dark:bg-white dark:text-ink">
          <LayoutDashboard size={20} strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            Dashboard
          </h1>
          <p className="text-sm text-ink-faint">
            Overview of your store performance
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="p-4">
            <div
              className={clsx(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                iconBg,
              )}
            >
              <Icon size={17} strokeWidth={2} className={iconColor} />
            </div>
            <p className="font-display text-2xl font-semibold text-ink">
              {isLoading ? "—" : (value ?? 0).toLocaleString()}
            </p>
            <span className="text-xs font-medium text-ink-faint">{label}</span>
          </Card>
        ))}
      </div>

      {/* Revenue trend chart */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Revenue — Last {rangeDays} Days
            </h3>
            <p className="text-xs text-ink-faint">Daily breakdown</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRangeDays(opt)}
                className={clsx(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  rangeDays === opt
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
                    : "text-ink-faint hover:text-ink",
                )}
              >
                {opt}d
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <RevenueTrendChart days={rangeDays} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Low stock products</h3>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <p className="p-4 text-sm text-ink-faint">Loading…</p>
            )}
            {!isLoading && (stats?.lowStockProducts.length ?? 0) === 0 && (
              <p className="p-4 text-sm text-ink-faint">
                All products are well stocked.
              </p>
            )}
            <ul className="divide-y divide-border">
              {stats?.lowStockProducts.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.category}</p>
                  </div>
                  <Badge
                    tone="danger"
                    className="bg-danger text-white border-danger"
                  >
                    {p.stock} left
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Top selling products</h3>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <p className="p-4 text-sm text-ink-faint">Loading…</p>
            )}
            {!isLoading && (stats?.topSellingProducts.length ?? 0) === 0 && (
              <p className="p-4 text-sm text-ink-faint">
                No sales recorded yet.
              </p>
            )}
            <ul className="divide-y divide-border">
              {stats?.topSellingProducts.map((p) => (
                <li
                  key={p.productId}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">{p.unitsSold} sold</p>
                    <p className="text-xs text-ink-faint">
                      ৳{p.revenue.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-ink-faint">Total revenue</span>
          <span className="font-display text-lg font-semibold text-ink">
            ৳{(stats?.totalRevenue ?? 0).toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
};
