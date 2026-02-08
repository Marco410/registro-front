"use client";

import { useAuth } from "registro/hooks/use-auth";
import { MobileMenuButton } from "./mobile-menu-button";

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void;
}

/**
 * Dashboard header: mobile menu button (left), user name and avatar (right).
 */
export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { user } = useAuth();

  const displayName =
    `${user?.name ?? ""} ${user?.lastName ?? ""} ${user?.secondLastName ?? ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "Usuario";
  const initial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-blue-200/80 bg-white px-4 backdrop-blur-sm dark:border-white-700 dark:bg-white-950/90">
      {onOpenMobileMenu ? (
        <MobileMenuButton onClick={onOpenMobileMenu} />
      ) : (
        <div className="w-10 lg:w-0" />
      )}
      <div className="flex flex-1 items-center justify-end gap-3">
        <span className="hidden truncate text-sm font-medium text-blue-800 sm:inline dark:text-blue-200">
          {displayName}
        </span>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white shadow-sm"
          aria-hidden
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
