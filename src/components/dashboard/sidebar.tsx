"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  CalendarCheckIn01Icon,
  ClipboardIcon,
  SeatSelectorIcon,
  Chart03Icon,
  UserSearch01Icon,
  CalendarLock02Icon,
  AuditIcon,
} from "@hugeicons/core-free-icons";
import { routes } from "registro/constants/routes";
import { TAB_CHECKIN, TAB_REGISTRO } from "registro/constants/const";
import { useAuth } from "registro/contexts/auth-context";
import { isAdmin } from "registro/lib/auth";

const baseNavItems = [
  { href: routes.dashboard(), label: "Inicio", icon: Home01Icon },
  {
    href: routes.dashboardRegistro(),
    label: "Registro",
    icon: ClipboardIcon,
    tab: TAB_REGISTRO,
  },
  {
    href: routes.dashboardCheckin(),
    label: "Check-in",
    icon: CalendarCheckIn01Icon,
    tab: TAB_CHECKIN,
  },
  { href: routes.dashboardAforo(), label: "Aforo", icon: SeatSelectorIcon },
  {
    href: routes.dashboardEstadisticas(),
    label: "Estadísticas",
    icon: Chart03Icon,
  },
] as const;

type NavItem = (typeof baseNavItems)[number] | {
  href: string;
  label: string;
  icon: typeof UserSearch01Icon;
};

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
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { user } = useAuth();

  const navItems: NavItem[] = isAdmin(user)
    ? [
        ...baseNavItems,
        { href: routes.dasboardEvents(), label: "Eventos", icon: CalendarLock02Icon },
        { href: routes.dasboardUsers(), label: "Usuarios", icon: UserSearch01Icon },
        { href: routes.dashboardAuditoria(), label: "Auditoría", icon: AuditIcon },
      ]
    : [...baseNavItems];

  const isItemActive = (item: NavItem) => {
    if ("tab" in item && item.tab) {
      return (
        pathname === routes.dashboard() &&
        (item.tab === tab || (item.tab === TAB_REGISTRO && tab == null))
      );
    }
    return pathname === item.href;
  };

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
            href={routes.dashboard()}
            className={`flex items-center overflow-hidden py-2 text-app-text-primary hover:opacity-90 ${
              isCollapsed ? "min-w-0 flex-none" : "min-w-0 flex-1 gap-2.5"
            }`}
          >
            <Image
              src="/images/logo.png"
              alt="A&R Morelia"
              width={36}
              height={36}
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
          {navItems.map((item) => {
            const { href, label, icon: Icon } = item;
            const isActive = isItemActive(item);
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
