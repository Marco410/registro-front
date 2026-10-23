"use client";

import { useQuery } from "@apollo/client";
import { Logout01Icon, SeatSelectorIcon } from "@hugeicons/core-free-icons";
import {
  AFORO_QUERY,
  type AforoResponse,
} from "registro/graphql/aforo/queries";
import { getAforoCounts } from "registro/lib/helpers/aforo-counts";
import { ConteoStat as Stat } from "./ConteoStat";
import { AFORO_POLL_MS } from "./seat-utils";

const panelClass =
  "flex divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-[#202124] sm:min-w-[22rem]";

/**
 * Resumen de personas del aforo (en el retiro y bajas, con desglose H/M) en
 * una sola franja compacta para el encabezado de la página.
 */
export function AforoResumen() {
  const { data, loading, error, refetch } = useQuery<AforoResponse>(AFORO_QUERY, {
    pollInterval: AFORO_POLL_MS,
  });
  const firstLoad = loading && !data;

  if (error && !data) {
    return (
      <div className={`${panelClass} items-center justify-between gap-3 px-4 py-3`}>
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar los conteos.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-app-primary/10 dark:text-app-primary-muted"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { enRetiro, bajas } = getAforoCounts(data);

  return (
    <div
      className={panelClass}
      aria-busy={firstLoad}
      aria-label={firstLoad ? "Cargando conteos del aforo" : undefined}
    >
      <Stat
        label="En el retiro"
        icon={SeatSelectorIcon}
        conteo={enRetiro}
        loading={firstLoad}
      />
      <Stat
        label="Bajas"
        icon={Logout01Icon}
        conteo={bajas}
        loading={firstLoad}
        totalClassName={
          bajas.total > 0
            ? "text-red-600 dark:text-red-400"
            : "text-app-text-primary dark:text-white"
        }
      />
    </div>
  );
}
