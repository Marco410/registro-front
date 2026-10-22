"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, SeatSelectorIcon } from "@hugeicons/core-free-icons";
import {
  AFORO_QUERY,
  type AforoResponse,
} from "registro/graphql/aforo/queries";
import {
  getAforoCounts,
  type ConteoPorSexo,
} from "registro/lib/helpers/aforo-counts";

type StatIcon = typeof SeatSelectorIcon;

function Stat({
  label,
  icon,
  conteo,
  totalClassName = "text-app-text-primary dark:text-white",
}: {
  label: string;
  icon: StatIcon;
  conteo: ConteoPorSexo;
  totalClassName?: string;
}) {
  return (
    <div className="min-w-0 flex-1 px-4 py-2.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-app-text-secondary dark:text-gray-400">
        <HugeiconsIcon icon={icon} size={14} className="shrink-0" aria-hidden />
        {label}
      </p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-3">
        <span
          className={`text-2xl font-semibold leading-tight tabular-nums ${totalClassName}`}
        >
          {conteo.total.toLocaleString("es")}
        </span>
        <span className="whitespace-nowrap text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
          <span className="font-semibold text-blue-700 dark:text-app-primary-muted">
            {conteo.hombres.toLocaleString("es")}
          </span>{" "}
          H ·{" "}
          <span className="font-semibold text-pink-700 dark:text-pink-400">
            {conteo.mujeres.toLocaleString("es")}
          </span>{" "}
          M
        </span>
      </p>
    </div>
  );
}

const panelClass =
  "flex divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-[#202124] sm:min-w-[22rem]";

/**
 * Resumen de personas del aforo (en el retiro y bajas, con desglose H/M) en
 * una sola franja compacta para el encabezado de la página.
 */
export function AforoResumen() {
  const { data, loading, error } = useQuery<AforoResponse>(AFORO_QUERY);

  if (loading && !data) {
    return (
      <div className={`${panelClass} animate-pulse`} aria-hidden>
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 space-y-2 px-4 py-2.5">
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudieron cargar los conteos del aforo.
      </p>
    );
  }

  const { enRetiro, bajas } = getAforoCounts(data);

  return (
    <div className={panelClass}>
      <Stat label="En el retiro" icon={SeatSelectorIcon} conteo={enRetiro} />
      <Stat
        label="Bajas"
        icon={Logout01Icon}
        conteo={bajas}
        totalClassName={
          bajas.total > 0
            ? "text-red-600 dark:text-red-400"
            : "text-app-text-primary dark:text-white"
        }
      />
    </div>
  );
}
