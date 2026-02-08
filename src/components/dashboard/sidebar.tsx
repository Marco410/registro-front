"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  CalendarCheckIn01Icon,
  ClipboardIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home01Icon },
  { href: "/dashboard/checkin", label: "Checkin", icon: CalendarCheckIn01Icon },
  { href: "/dashboard/registro", label: "Registro", icon: ClipboardIcon },
] as const;

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
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
          fixed left-0 top-0 z-50 flex h-screen min-h-screen flex-col border-r border-blue-200/80 
          bg-white shadow-sm transition-[width,transform] duration-200 ease-in-out dark:border-blue-700 dark:bg-blue-900 dark:shadow-none
          lg:sticky lg:top-0 lg:h-screen
          ${isCollapsed ? "w-[72px]" : "w-56"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {/* Logo + collapse button row */}
        <div
          className={`flex min-h-[64px] items-center border-b border-blue-200/80 dark:border-blue-700 ${
            isCollapsed ? "justify-center gap-0 px-1" : "gap-2 px-3"
          }`}
        >
          <Link
            href="/dashboard"
            className={`flex items-center overflow-hidden py-2 ${
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
              <span className="truncate text-sm font-semibold tracking-tight text-blue-900 dark:text-blue-100">
                A&R Morelia
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-200"
          >
            <HugeiconsIcon
              icon={isCollapsed ? ArrowRight01Icon : ArrowLeft01Icon}
              size={18}
            />
          </button>
        </div>

        {/* Nav */}
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
                      ? "border-l-2 border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-200"
                      : "border-l-2 border-transparent text-blue-700 hover:bg-blue-100/80 hover:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-800/80 dark:hover:text-blue-100"
                  }
                  ${isCollapsed ? "justify-center px-2" : "pl-[calc(0.75rem-2px)]"}
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
