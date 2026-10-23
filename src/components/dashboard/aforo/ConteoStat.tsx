"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { SeatSelectorIcon } from "@hugeicons/core-free-icons";
import type { ConteoPorSexo } from "registro/lib/helpers/aforo-counts";
import { TextBone } from "registro/components/shared/Skeleton";

type StatIcon = typeof SeatSelectorIcon;

export interface ConteoStatProps {
  label: string;
  icon?: StatIcon;
  conteo?: ConteoPorSexo;
  /** Mientras carga, la etiqueta se pinta y solo laten la cifra y el desglose. */
  loading?: boolean;
  /** Color del total (por defecto, el del texto). */
  totalClassName?: string;
  className?: string;
}

/**
 * Un conteo con su desglose por sexo: etiqueta, total grande y "N H · N M".
 * Se usa en las franjas de resumen del aforo (personas y bautizos) y trae su esqueleto.
 */
export function ConteoStat({
  label,
  icon,
  conteo,
  loading = false,
  totalClassName = "text-app-text-primary dark:text-white",
  className = "",
}: ConteoStatProps) {
  const labelRow = (
    <p className="flex items-center gap-1.5 text-xs font-medium text-app-text-secondary dark:text-gray-400">
      {icon ? (
        <HugeiconsIcon icon={icon} size={14} className="shrink-0" aria-hidden />
      ) : null}
      {label}
    </p>
  );

  if (loading || !conteo) {
    return (
      <div className={`min-w-0 flex-1 px-4 py-2.5 ${className}`}>
        {labelRow}
        {/* Misma altura que la fila real (cifra de 28px + desglose). */}
        <div className="mt-0.5 flex h-[1.875rem] items-center gap-3">
          <TextBone size="figure" width={label.length > 10 ? 52 : 40} />
          <TextBone width={64} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-w-0 flex-1 px-4 py-2.5 ${className}`}>
      {labelRow}
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
