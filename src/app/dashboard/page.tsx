"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarCheckIn01Icon, ClipboardIcon } from "@hugeicons/core-free-icons";
import CheckinPage from "./checkin/page";
import DashboardRegistroPage from "./registro/page";
import { routes } from "registro/constants/routes";
import { TAB_CHECKIN, TAB_REGISTRO } from "registro/constants/const";


const VALID_TABS = [TAB_CHECKIN, TAB_REGISTRO] as const;
type TabValue = (typeof VALID_TABS)[number];

function parseTab(value: string | null): TabValue {
  if (value === TAB_CHECKIN || value === TAB_REGISTRO) return value;
  return TAB_REGISTRO;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  return (
    <div className="w-full">
      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
      <Link
          href={routes.dashboardRegistro()}
          className={`
            flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
            ${
              tab === TAB_REGISTRO
                ? "border-app-primary text-app-primary dark:border-app-primary-muted dark:text-app-primary-muted"
                : "border-transparent text-app-text-secondary hover:border-gray-300 hover:text-app-text-primary dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }
          `}
        >
          <HugeiconsIcon icon={ClipboardIcon} size={20} />
          Registro
        </Link>
        <Link
          href={routes.dashboardCheckin()}
          className={`
            flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
            ${
              tab === TAB_CHECKIN
                ? "border-app-primary text-app-primary dark:border-app-primary-muted dark:text-app-primary-muted"
                : "border-transparent text-app-text-secondary hover:border-gray-300 hover:text-app-text-primary dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }
          `}
        >
          <HugeiconsIcon icon={CalendarCheckIn01Icon} size={20} />
          Check-in
        </Link>
      </div>

      {tab === TAB_REGISTRO && <DashboardRegistroPage />}
      {tab === TAB_CHECKIN && <CheckinPage />}
    </div>
  );
}
