"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChurchIcon,
  Download01Icon,
  UserAdd01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import {
  BAUTIZO_COUNTS_QUERY,
  type BautizoCountsResponse,
} from "registro/graphql/aforo/queries";
import type { ConteoPorSexo } from "registro/lib/helpers/aforo-counts";
import { BautizoForaneosModal } from "registro/components/shared/BautizoForaneosModal";
import { useExportListaBautizos } from "./hooks";
import { ConteoStat } from "./ConteoStat";

const actionButtonClass =
  "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-app-primary-muted";

/**
 * Bautizos del aforo en una sola franja: encontrados con bautizo aplicado,
 * foráneos registrados aparte y el total, cada uno con su desglose H/M. Desde
 * aquí se registran foráneos y se exporta la lista de bautizados (CSV).
 */
export function BautizosResumen() {
  const [foraneosOpen, setForaneosOpen] = useState(false);
  const { exportLista, loading: exporting } = useExportListaBautizos();
  const { data, loading, error, refetch } =
    useQuery<BautizoCountsResponse>(BAUTIZO_COUNTS_QUERY);
  const firstLoad = loading && !data;

  const encontrados: ConteoPorSexo = {
    total: data?.encontradosBautizoCount ?? 0,
    hombres: data?.encontradosBautizoCountH ?? 0,
    mujeres: data?.encontradosBautizoCountM ?? 0,
  };
  const foraneos: ConteoPorSexo = {
    total: data?.bautizoForaneosCount ?? 0,
    hombres: data?.bautizoForaneosCountH ?? 0,
    mujeres: data?.bautizoForaneosCountM ?? 0,
  };
  const total: ConteoPorSexo = {
    total: encontrados.total + foraneos.total,
    hombres: encontrados.hombres + foraneos.hombres,
    mujeres: encontrados.mujeres + foraneos.mujeres,
  };

  return (
    <section
      aria-labelledby="bautizos-title"
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]"
    >
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2
            id="bautizos-title"
            className="text-base font-semibold text-app-text-primary dark:text-white"
          >
            Bautizos
          </h2>
          <p className="mt-0.5 text-xs text-app-text-secondary dark:text-gray-400">
            Encontrados con bautizo aplicado en el aforo y foráneos registrados
            aparte.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setForaneosOpen(true)}
            className={actionButtonClass}
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} className="shrink-0" />
            Foráneos bautizados
          </button>
          <button
            type="button"
            onClick={() => exportLista()}
            disabled={firstLoad || exporting || total.total === 0}
            title="Descarga un CSV con clave y nombre de todos los bautizados"
            className={actionButtonClass}
          >
            <HugeiconsIcon icon={Download01Icon} size={16} className="shrink-0" />
            {exporting ? "Exportando…" : "Exportar lista"}
          </button>
        </div>
      </div>

      {error && !data ? (
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            No se pudieron cargar los bautizos.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-app-primary/10 dark:text-app-primary-muted"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div
          aria-busy={firstLoad}
          aria-label={firstLoad ? "Cargando bautizos" : undefined}
          className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 sm:flex-row sm:divide-x sm:divide-y-0"
        >
          <ConteoStat
            label="Encontrados"
            icon={ChurchIcon}
            conteo={encontrados}
            loading={firstLoad}
          />
          <ConteoStat
            label="Foráneos"
            icon={UserMultipleIcon}
            conteo={foraneos}
            loading={firstLoad}
          />
          <ConteoStat
            label="Total bautizados"
            conteo={total}
            loading={firstLoad}
            totalClassName="text-green-700 dark:text-green-400"
            className="bg-green-50/60 dark:bg-green-500/[0.06]"
          />
        </div>
      )}

      <BautizoForaneosModal
        open={foraneosOpen}
        onClose={() => setForaneosOpen(false)}
      />
    </section>
  );
}
