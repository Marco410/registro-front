"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon, TableIcon } from "@hugeicons/core-free-icons";
import type { CubetaHora } from "registro/lib/helpers/estadisticas";
import { ChartCard, Leyenda, SERIES, SinDatos } from "./chart-ui";

const HORA_MS = 60 * 60 * 1000;

const hora = (t: number) =>
  new Date(t).toLocaleTimeString("es", { hour: "numeric", hour12: true });
const dia = (t: number) =>
  new Date(t).toLocaleDateString("es", { day: "numeric", month: "short" });
const rango = (t: number) => `${dia(t)}, ${hora(t)} – ${hora(t + HORA_MS)}`;

/** Paso "redondo" (1, 2, 5 × 10ⁿ) para unas 4 marcas del eje. */
function pasoRedondo(max: number): number {
  if (max <= 4) return 1;
  const crudo = max / 4;
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const n = crudo / potencia;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * potencia;
}

function Columna({ valor, tope, fill }: { valor: number; tope: number; fill: string }) {
  return (
    <span
      className={`w-full max-w-[12px] rounded-t-[4px] ${fill}`}
      style={{ height: valor > 0 ? `max(2px, ${(valor / tope) * 100}%)` : 0 }}
    />
  );
}

export interface ActividadPorHoraProps {
  cubetas: CubetaHora[];
  recortado: boolean;
}

/**
 * Registros y check-ins por hora (columnas agrupadas, un solo eje). Cada hora es zona
 * de hover; con el foco en la gráfica, las flechas recorren las horas. El tooltip
 * mejora pero no es el único acceso: la vista de tabla tiene todos los valores.
 */
export function ActividadPorHora({ cubetas, recortado }: ActividadPorHoraProps) {
  const [activo, setActivo] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const maxValor = Math.max(0, ...cubetas.map((c) => Math.max(c.registros, c.checkins)));
  const paso = pasoRedondo(Math.max(1, maxValor));
  const tope = Math.max(paso, Math.ceil(maxValor / paso) * paso);
  const marcas = Array.from({ length: tope / paso + 1 }, (_, i) => i * paso);
  const cadaN = Math.max(1, Math.ceil(cubetas.length / 8));
  const pico = cubetas.reduce<CubetaHora | null>(
    (mejor, c) => (c.checkins > (mejor?.checkins ?? 0) ? c : mejor),
    null,
  );
  const conActividad = cubetas.filter((c) => c.registros + c.checkins > 0);
  const actual = activo != null ? cubetas[activo] : null;

  const subtitle = (
    <>
      {recortado
        ? "Últimas 48 horas con actividad."
        : "De la primera a la última hora con actividad."}
      {pico ? ` Pico de check-ins: ${rango(pico.inicio)} (${pico.checkins}).` : ""}
    </>
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (cubetas.length === 0) return;
    const ultimo = cubetas.length - 1;
    const base = activo ?? ultimo;
    const siguiente =
      e.key === "ArrowLeft"
        ? Math.max(0, base - 1)
        : e.key === "ArrowRight"
          ? Math.min(ultimo, base + 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? ultimo
              : null;
    if (siguiente == null) return;
    e.preventDefault();
    setActivo(siguiente);
  };

  return (
    <ChartCard
      title="Actividad por hora"
      subtitle={subtitle}
      aside={
        <>
          <Leyenda series={["registros", "checkins"]} />
          <button
            type="button"
            onClick={() => setVerTabla((v) => !v)}
            disabled={cubetas.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-app-text-primary transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <HugeiconsIcon icon={verTabla ? ChartColumnIcon : TableIcon} size={14} />
            {verTabla ? "Ver gráfica" : "Ver tabla"}
          </button>
        </>
      }
    >
      {cubetas.length === 0 ? (
        <SinDatos>Todavía no hay registros ni check-ins.</SinDatos>
      ) : verTabla ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Registros y check-ins por hora</caption>
            <thead className="sticky top-0 bg-white dark:bg-[#202124]">
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                <th scope="col" className="pb-2 text-left">
                  Hora
                </th>
                <th scope="col" className="pb-2 text-right">
                  Registros
                </th>
                <th scope="col" className="pb-2 text-right">
                  Check-ins
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {conActividad.map((c) => (
                <tr key={c.inicio}>
                  <th
                    scope="row"
                    className="py-1.5 text-left font-normal text-app-text-primary dark:text-gray-200"
                  >
                    {rango(c.inicio)}
                  </th>
                  <td className="py-1.5 text-right tabular-nums text-app-text-primary dark:text-gray-200">
                    {c.registros}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-app-text-primary dark:text-gray-200">
                    {c.checkins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative h-44 w-7 shrink-0" aria-hidden>
            {marcas.map((m) => (
              <span
                key={m}
                className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-app-text-secondary dark:text-gray-400"
                style={{ bottom: `${(m / tope) * 100}%` }}
              >
                {m}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div
              role="group"
              tabIndex={0}
              aria-label="Actividad por hora. Usa las flechas izquierda y derecha para recorrer las horas."
              onKeyDown={onKeyDown}
              onFocus={() => setActivo((a) => a ?? cubetas.length - 1)}
              onBlur={() => setActivo(null)}
              onMouseLeave={() => setActivo(null)}
              className="relative h-44 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50"
            >
              {marcas.map((m) => (
                <div
                  key={m}
                  className="absolute inset-x-0 border-t border-gray-200 dark:border-gray-700"
                  style={{ bottom: `${(m / tope) * 100}%` }}
                  aria-hidden
                />
              ))}
              <div className="absolute inset-0 flex items-end" aria-hidden>
                {cubetas.map((c, i) => (
                  <div
                    key={c.inicio}
                    onMouseEnter={() => setActivo(i)}
                    className={`flex h-full flex-1 items-end justify-center gap-[2px] px-[1px] ${
                      activo === i ? "bg-gray-100 dark:bg-white/[0.06]" : ""
                    }`}
                  >
                    <Columna valor={c.registros} tope={tope} fill={SERIES.registros.fill} />
                    <Columna valor={c.checkins} tope={tope} fill={SERIES.checkins.fill} />
                  </div>
                ))}
              </div>
              {actual ? (
                <div
                  className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700"
                  style={{
                    left: `clamp(80px, ${((activo! + 0.5) / cubetas.length) * 100}%, calc(100% - 80px))`,
                  }}
                >
                  <p className="mb-1 text-[11px] text-gray-300">{rango(actual.inicio)}</p>
                  <p className="flex items-center gap-2">
                    <span className="h-0.5 w-3 rounded-full bg-[#8b5cf6]" aria-hidden />
                    <span className="font-semibold tabular-nums">{actual.registros}</span>
                    registros
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-0.5 w-3 rounded-full bg-[#16a34a]" aria-hidden />
                    <span className="font-semibold tabular-nums">{actual.checkins}</span>
                    check-ins
                  </p>
                </div>
              ) : null}
            </div>
            <div className="relative mt-1.5 h-8" aria-hidden>
              {cubetas.map((c, i) => {
                if (i % cadaN !== 0) return null;
                const anterior = i - cadaN >= 0 ? cubetas[i - cadaN] : null;
                const cambiaDia = !anterior || dia(anterior.inicio) !== dia(c.inicio);
                return (
                  <span
                    key={c.inicio}
                    className="absolute -translate-x-1/2 whitespace-nowrap text-center text-[11px] leading-tight text-app-text-secondary dark:text-gray-400"
                    style={{ left: `${((i + 0.5) / cubetas.length) * 100}%` }}
                  >
                    {hora(c.inicio)}
                    {cambiaDia ? <span className="block">{dia(c.inicio)}</span> : null}
                  </span>
                );
              })}
            </div>
            <p className="sr-only" aria-live="polite">
              {actual
                ? `${rango(actual.inicio)}: ${actual.registros} registros, ${actual.checkins} check-ins`
                : ""}
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
