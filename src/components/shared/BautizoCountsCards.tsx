"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, CalendarCheckIn01Icon } from "@hugeicons/core-free-icons";
import {
  BAUTIZO_COUNTS_QUERY,
  BautizoCountsResponse,
} from "registro/graphql/aforo/queries";
import { BautizoForaneosModal } from "registro/components/shared/BautizoForaneosModal";
import { useExportListaBautizos } from "registro/components/dashboard/aforo/hooks";

const cardBase =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#202124]";

export function BautizoCountsCards() {
  const [foraneosModalOpen, setForaneosModalOpen] = useState(false);
  const { exportLista, loading: exportLoading } = useExportListaBautizos();
  const { data, loading, error } = useQuery<BautizoCountsResponse>(
    BAUTIZO_COUNTS_QUERY,
    {
      //pollInterval: 10000,
    },
  );

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
    encontradosBautizoCount: 0,
    encontradosBautizoCountH: 0,
    encontradosBautizoCountM: 0,
    bautizoForaneosCount: 0,
    bautizoForaneosCountH: 0,
    bautizoForaneosCountM: 0,
  };

  const cards = [
    {
      key: "total-bautizados",
      label: "Total bautizados",
      value: counts.encontradosBautizoCount,
      icon: UserIcon,
      className: "text-app-text-primary dark:text-gray-200",
      iconBg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      key: "hombres-bautizados",
      label: "Hombres bautizados",
      value: counts.encontradosBautizoCountH,
      icon: UserIcon,
      className: "text-app-primary dark:text-app-primary-muted",
      iconBg: "bg-app-primary/10 dark:bg-app-primary-muted/20",
    },
    {
      key: "mujeres-bautizadas",
      label: "Mujeres bautizadas",
      value: counts.encontradosBautizoCountM,
      icon: UserIcon,
      className: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
    {
      key: "foraneos-total",
      label: "Foraneos bautizados",
      value: counts.bautizoForaneosCount,
      icon: UserIcon,
      className: "text-app-text-primary dark:text-gray-200",
      iconBg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      key: "foraneos-hombres",
      label: "Foraneos bautizados (H)",
      value: counts.bautizoForaneosCountH,
      icon: UserIcon,
      className: "text-app-primary dark:text-app-primary-muted",
      iconBg: "bg-app-primary/10 dark:bg-app-primary-muted/20",
    },
    {
      key: "foraneas-mujeres",
      label: "Foraneas bautizadas",
      value: counts.bautizoForaneosCountM,
      icon: UserIcon,
      className: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
  ];

  const cardsTotal = [
    {
      label: "Total",
      value: counts.encontradosBautizoCount + counts.bautizoForaneosCount,
      icon: UserIcon,
      className: "text-app-text-primary dark:text-gray-200",
      iconBg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      label: "Hombres",
      value: counts.encontradosBautizoCountH + counts.bautizoForaneosCountH,
      icon: UserIcon,
      className: "text-app-primary dark:text-app-primary-muted",
      iconBg: "bg-app-primary/10 dark:bg-app-primary-muted/20",
    },
    {
      label: "Mujeres",
      value: counts.encontradosBautizoCountM + counts.bautizoForaneosCountM,
      icon: UserIcon,
      className: "text-pink-600 dark:text-pink-400",
      iconBg: "bg-pink-500/10 dark:bg-pink-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {cards.map(({ key, label, value, icon: Icon, className, iconBg }) => (
          <div key={key} className={cardBase}>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardsTotal.map(({ label, value, icon: Icon, className, iconBg }) => (
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
      <div className={"flex justify-end gap-2"}>
        <button
          type="button"
          onClick={() => exportLista()}
          disabled={exportLoading}
          className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-500/90 disabled:opacity-50 dark:bg-green-500-muted dark:hover:bg-green-500-muted/90"
        >
          {exportLoading ? "Exportando…" : "Exportar lista"}
        </button>
        <button
          type="button"
          onClick={() => setForaneosModalOpen(true)}
          className="rounded-xl bg-app-primary px-4 py-2 text-sm font-medium text-white hover:bg-app-primary/90 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
        >
          Bautizos foráneos
        </button>
      </div>
      <BautizoForaneosModal
        open={foraneosModalOpen}
        onClose={() => setForaneosModalOpen(false)}
      />
    </div>
  );
}
