"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "registro/hooks/use-auth";
import { useActiveEvent } from "registro/contexts/active-event-context";
import { MobileMenuButton } from "registro/components/dashboard/mobile-menu-button";
import { FontSizeControl } from "./font-size-control";
import { HeaderClock } from "./header-clock";
import { typeLabels } from "./events/events-grid";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({ onToggleSidebar, onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { eventName, eventType } = useActiveEvent();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = user?.name?.[0] ?? user?.email?.[0] ?? "?";
  const displayName =
    `${user?.name ?? ""} ${user?.lastName ?? ""} ${user?.secondLastName ?? ""}`.trim() ||
    user?.email ||
    "Usuario";

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b border-gray-200 bg-app-sidebar px-4 dark:border-gray-700 dark:bg-[#202124]">
      <div className="flex min-w-0 max-w-[min(100%,28rem)] flex-1 items-center gap-2 sm:max-w-none sm:flex-none lg:max-w-none">
        <MobileMenuButton onClick={onOpenMobileMenu} />
       
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden shrink-0 rounded-lg p-2 text-app-text-secondary hover:bg-app-selected hover:text-app-primary dark:text-gray-400 dark:hover:bg-gray-800 lg:block"
          aria-label="Colapsar menú"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {eventName ? (
          <span
            className="min-w-0 truncate text-md font-bold text-app-text-primary dark:text-gray-200"
            title={eventName}
          >
            {eventName} - {eventType ? typeLabels[eventType] : ""}
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <HeaderClock />
        <FontSizeControl />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-app-selected/50 dark:hover:bg-gray-700"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Menú de usuario"
          >
            <span className="text-sm font-medium text-app-text-primary dark:text-gray-200">
              {displayName}
            </span>
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-app-primary text-sm font-semibold text-white"
              aria-hidden
            >
              {initial.toUpperCase()}
            </div>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-gray-200 bg-app-sidebar py-1 shadow-lg dark:border-gray-700 dark:bg-[#202124]"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-app-text-primary transition-colors hover:bg-app-selected dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
