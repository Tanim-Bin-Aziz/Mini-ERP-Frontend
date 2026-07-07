import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { navItems } from "@/components/navConfig";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useRealtimeNotifications();

  const currentTitle =
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ??
    "Overview";

  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={currentTitle} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
