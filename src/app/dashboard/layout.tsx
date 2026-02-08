"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "registro/components/dashboard/sidebar";
import { DashboardHeader } from "registro/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-blue-950">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col ${sidebarCollapsed ? "" : ""}`}
      >
        <DashboardHeader onOpenMobileMenu={openMobileMenu} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
