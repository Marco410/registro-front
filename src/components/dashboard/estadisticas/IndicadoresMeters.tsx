"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { SmartPhone01Icon } from "@hugeicons/core-free-icons";
import type { ConteoPorSexo } from "registro/lib/helpers/aforo-counts";
import { porcentaje } from "registro/lib/helpers/estadisticas";

export interface Indicador {
  label: string;
  icon: typeof SmartPhone01Icon;
  conteo: ConteoPorSexo;
}

export interface IndicadoresMetersProps {
  items: Indicador[];
  /** Personas de la población; cada barra es su proporción sobre este total. */
  poblacion: number;
}

/**
 * Proporciones de la población (celular, medicamento, padecimiento, bautizo) como
 * medidores: la pista es un tono claro de la misma rampa que el relleno. El valor,
 * el porcentaje y el desglose H/M van escritos.
 */
export function IndicadoresMeters({ items, poblacion }: IndicadoresMetersProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const ratio = poblacion > 0 ? item.conteo.total / poblacion : 0;
        return (
          <li key={item.label} className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="flex items-center gap-2 text-sm text-app-text-primary dark:text-gray-200">
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  className="shrink-0 text-app-text-secondary dark:text-gray-400"
                  aria-hidden
                />
                {item.label}
              </span>
              <span className="text-sm text-app-text-secondary dark:text-gray-400">
                <span className="font-semibold text-app-text-primary dark:text-white">
                  {item.conteo.total.toLocaleString("es")}
                </span>{" "}
                · {porcentaje(item.conteo.total, poblacion)}
                <span className="ml-2 text-xs tabular-nums">
                  {item.conteo.hombres} H · {item.conteo.mujeres} M
                </span>
              </span>
            </div>
            <div
              role="meter"
              aria-label={item.label}
              aria-valuemin={0}
              aria-valuemax={poblacion}
              aria-valuenow={item.conteo.total}
              aria-valuetext={`${item.conteo.total} de ${poblacion}`}
              className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
            >
              <div
                className="h-full rounded-full bg-slate-500 dark:bg-slate-400"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
