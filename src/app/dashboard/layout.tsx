"use client";

import { useState } from "react";
import { RequireAuth } from "registro/components/auth/require-auth";
import { Sidebar } from "registro/components/dashboard/sidebar";
import { Header } from "registro/components/dashboard/header";
import { MobileMenuButton } from "registro/components/dashboard/mobile-menu-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-app-surface dark:bg-[#202124]">
        <Header
          onToggleSidebar={() => setIsCollapsed((c) => !c)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        <div className="flex flex-1">
          <Sidebar
            isCollapsed={isCollapsed}
            isMobileOpen={isMobileOpen}
            onMobileClose={() => setIsMobileOpen(false)}
          />
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
