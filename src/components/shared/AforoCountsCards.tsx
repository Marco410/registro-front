"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  SeatSelectorIcon,
} from "@hugeicons/core-free-icons";
import {
  AFORO_QUERY,
  type AforoResponse,
} from "registro/graphql/aforo/queries";
import { getAforoCounts } from "registro/lib/helpers/aforo-counts";
import { AnimatedMount } from ".";

type StatIcon = typeof SeatSelectorIcon;

type StatItem = {
  label: string;
  value: number;
  valueClassName: string;
};

type MetricPanelConfig = {
  key: string;
  title: string;
  icon: StatIcon;
  accentClass: string;
  iconBg: string;
  stats: StatItem[];
};

function MetricStat({ label, value, valueClassName }: StatItem) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-2.5 sm:px-3">
      <span className="text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
        {label}
      </span>
      <span
        className={`text-xl font-bold tabular-nums leading-none sm:text-2xl ${valueClassName}`}
      >
        {value.toLocaleString("es")}
      </span>
    </div>
  );
}

function MetricPanel({
  title,
  icon: Icon,
  accentClass,
  iconBg,
  stats,
}: Omit<MetricPanelConfig, "key">) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124] ${accentClass}`}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-700 sm:px-4">
        <span
          className={`inline-flex rounded-lg p-1.5 ${iconBg} text-app-text-secondary dark:text-gray-400`}
        >
          <HugeiconsIcon icon={Icon} size={16} />
        </span>
        <h2 className="text-sm font-semibold text-app-text-primary dark:text-gray-200">
          {title}
        </h2>
      </div>
      <div className="flex divide-x divide-gray-100 dark:divide-gray-700">
        {stats.map((stat) => (
          <MetricStat key={stat.label} {...stat} />
        ))}
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex p-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex flex-1 flex-col items-center gap-2 px-3 py-2">
                <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AforoCountsCards() {
  const { data, loading, error } = useQuery<AforoResponse>(AFORO_QUERY, {
    //pollInterval: 10000,
  });

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Error al cargar los conteos
      </p>
    );
  }

  const { enRetiro, bajas } = getAforoCounts(data);

  const panels: MetricPanelConfig[] = [
    {
      key: "en-foro",
      title: "En el retiro",
      icon: SeatSelectorIcon,
      accentClass: "border-t-[3px] border-t-green-500 dark:border-t-green-400",
      iconBg: "bg-green-500/10 dark:bg-green-500/20",
      stats: [
        {
          label: "Total",
          value: enRetiro.total,
          valueClassName: "text-app-text-primary dark:text-gray-200",
        },
        {
          label: "Hombres",
          value: enRetiro.hombres,
          valueClassName: "text-app-primary dark:text-app-primary-muted",
        },
        {
          label: "Mujeres",
          value: enRetiro.mujeres,
          valueClassName: "text-pink-600 dark:text-pink-400",
        },
      ],
    },
    {
      key: "bajas",
      title: "Bajas",
      icon: Logout01Icon,
      accentClass: "border-t-[3px] border-t-red-400 dark:border-t-red-500",
      iconBg: "bg-red-500/10 dark:bg-red-500/20",
      stats: [
        {
          label: "Total",
          value: bajas.total,
          valueClassName: "text-gray-700 dark:text-gray-200",
        },
        {
          label: "Hombres",
          value: bajas.hombres,
          valueClassName: "text-app-primary dark:text-app-primary-muted",
        },
        {
          label: "Mujeres",
          value: bajas.mujeres,
          valueClassName: "text-pink-600 dark:text-pink-400",
        },
      ],
    },
  ];

  return (
    <AnimatedMount show animationKey="aforo-counts-cards">
      <div className="grid gap-3 sm:grid-cols-2">
        {panels.map(({ key, ...panel }) => (
          <MetricPanel key={key} {...panel} />
        ))}
      </div>
    </AnimatedMount>
  );
}
