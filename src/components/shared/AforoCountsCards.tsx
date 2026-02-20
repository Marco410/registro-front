"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Male02Icon,
  Female02Icon,
  CalendarCheckIn01Icon,
} from "@hugeicons/core-free-icons";
import {
  AFORO_QUERY,
  type AforoResponse,
} from "registro/graphql/aforo/queries";

const cardBase =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#202124]";

export function AforoCountsCards() {
  const { data, loading, error } = useQuery<AforoResponse>(AFORO_QUERY, {
    pollInterval: 10000,
  });

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`${cardBase} animate-pulse`}>
            <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-8 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Error al cargar los conteos
      </p>
    );
  }

  const counts = data ?? {
    encontradosCount: 0,
    checkinsCount: 0,
    encontradosCountH: 0,
    encontradosCountM: 0,
    checkinsCountH: 0,
    checkinsCountM: 0,
  };

  const cards = [
    {
      label: "Total",
      value: counts.checkinsCount,
      icon: CalendarCheckIn01Icon,
      className: "text-app-text-primary dark:text-gray-200",
      iconBg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      label: "Hombres",
      value: counts.checkinsCountH,
      icon: CalendarCheckIn01Icon,
      className: "text-app-primary dark:text-app-primary-muted",
      iconBg: "bg-app-primary/10 dark:bg-app-primary-muted/20",
    },
    {
      label: "Mujeres",
      value: counts.checkinsCountM,
      icon: CalendarCheckIn01Icon,
      className: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
    {
      label: "Total encontrados",
      value: counts.encontradosCount,
      icon: UserIcon,
      className: "text-app-text-primary dark:text-gray-200",
      iconBg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      label: "Hombres encontrados",
      value: counts.encontradosCountH,
      icon: UserIcon,
      className: "text-app-primary dark:text-app-primary-muted",
      iconBg: "bg-app-primary/10 dark:bg-app-primary-muted/20",
    },
    {
      label: "Mujeres encontradas",
      value: counts.encontradosCountM,
      icon: UserIcon,
      className: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, className, iconBg }) => (
        <div key={label} className={cardBase}>
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-app-text-secondary dark:text-gray-400">
              {label}
            </p>
            <span
              className={`inline-flex rounded-lg p-2 ${iconBg} ${className}`}
              aria-hidden
            >
              <HugeiconsIcon icon={Icon} size={22} />
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${className}`}>
            {value.toLocaleString("es")}
          </p>
        </div>
      ))}
    </div>
  );
}
