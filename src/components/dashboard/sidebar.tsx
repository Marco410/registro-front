"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  CalendarCheckIn01Icon,
  ClipboardIcon,
} from "@hugeicons/core-free-icons";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home01Icon },
  { href: "/dashboard/checkin", label: "Checkin", icon: CalendarCheckIn01Icon },
  { href: "/dashboard/registro", label: "Registro", icon: ClipboardIcon },
] as const;

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  isCollapsed,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen min-h-screen flex-col           border-r border-gray-200 
          bg-app-sidebar shadow-sm transition-[width,transform] duration-200 ease-in-out dark:border-gray-700 dark:bg-[#202124]
          lg:sticky lg:top-0 lg:h-screen
          ${isCollapsed ? "w-[72px]" : "w-56"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div
          className={`flex min-h-[64px] items-center border-b border-gray-200 dark:border-gray-700 ${
            isCollapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <Link
            href="/dashboard"
            className={`flex items-center overflow-hidden py-2 text-app-text-primary hover:opacity-90 ${
              isCollapsed ? "min-w-0 flex-none" : "min-w-0 flex-1 gap-2.5"
            }`}
          >
            <img
              src="/images/logo.png"
              alt="A&R Morelia"
              className={`shrink-0 object-contain object-left ${
                isCollapsed ? "h-8 w-8" : "h-9 w-9"
              }`}
            />
            {!isCollapsed && (
              <span className="truncate text-sm font-semibold tracking-tight">
                A&R Morelia
              </span>
            )}
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-app-selected text-app-primary dark:bg-app-selected/20 dark:text-app-primary-muted"
                      : "text-app-text-secondary hover:bg-gray-100 hover:text-app-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-app-primary-muted"
                  }
                  ${isCollapsed ? "justify-center px-2" : "pl-3"}
                `}
              >
                <HugeiconsIcon icon={Icon} size={22} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
