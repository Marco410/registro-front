"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData01Icon, TableIcon } from "@hugeicons/core-free-icons";
import {
  INTERVALO_ACUMULADO_MIN,
  type PuntoAcumulado,
} from "registro/lib/helpers/estadisticas";
import { ChartCard, SERIES, SinDatos, escalaEje } from "./chart-ui";

const horaMinuto = (t: number) =>
  new Date(t).toLocaleTimeString("es", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
const hora = (t: number) =>
  new Date(t).toLocaleTimeString("es", { hour: "numeric", hour12: true });
const dia = (t: number) =>
  new Date(t).toLocaleDateString("es", { day: "numeric", month: "short" });
const desglose = (p: PuntoAcumulado, medida: Medida) =>
  `${p[`${medida}H`]} hombres, ${p[`${medida}M`]} mujeres`;

type Medida = "registros" | "checkins";
type Campo = Exclude<keyof PuntoAcumulado, "t">;

interface Linea {
  label: string;
  campo: Campo;
  serie: (typeof SERIES)[keyof typeof SERIES];
}

/** Las tres líneas de un panel: el total de la medida (su color), hombres y mujeres. */
function lineasDe(medida: Medida): Linea[] {
  return [
    { label: "Total", campo: medida, serie: SERIES[medida] },
    { label: "Hombres", campo: `${medida}H`, serie: SERIES.H },
    { label: "Mujeres", campo: `${medida}M`, serie: SERIES.M },
  ];
}

/**
 * Posiciones (en % desde arriba) de las etiquetas al final de las líneas, separadas al
 * menos `minimo` % para que no se encimen cuando los valores son parecidos.
 */
function separarEtiquetas(ys: number[], minimo = 9): number[] {
  const orden = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let j = 1; j < orden.length; j++) {
    orden[j].y = Math.max(orden[j].y, orden[j - 1].y + minimo);
  }
  const exceso = orden[orden.length - 1].y - 100;
  if (exceso > 0) for (const o of orden) o.y -= exceso;
  const resultado = new Array<number>(ys.length);
  for (const o of orden) resultado[o.i] = o.y;
  return resultado;
}

interface PanelProps {
  titulo: string;
  medida: Medida;
  puntos: PuntoAcumulado[];
  tope: number;
  marcas: number[];
  etiquetasX: number[];
  activo: number | null;
  onActivo: (k: number | null) => void;
  onTecla: (e: React.KeyboardEvent) => void;
}

/** Un panel con sus tres líneas. El cursor (índice `activo`) se comparte entre paneles. */
function PanelLineas({
  titulo,
  medida,
  puntos,
  tope,
  marcas,
  etiquetasX,
  activo,
  onActivo,
  onTecla,
}: PanelProps) {
  const lineas = lineasDe(medida);
  const n = puntos.length - 1;
  const x = (k: number) => (k / n) * 100;
  const y = (v: number) => 100 - (v / tope) * 100;
  const ultimo = puntos[n];
  const etiquetasY = separarEtiquetas(lineas.map((l) => y(ultimo[l.campo])));
  const actual = activo != null ? puntos[activo] : null;
  const anterior = activo != null && activo > 0 ? puntos[activo - 1] : null;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.round(((e.clientX - r.left) / r.width) * n);
    onActivo(Math.min(n, Math.max(0, k)));
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-app-text-primary dark:text-gray-100">
          {titulo}
        </h3>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-secondary dark:text-gray-400">
          {lineas.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span className={`h-0.5 w-3 rounded-full ${l.serie.fill}`} aria-hidden />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <div className="relative h-44 w-7 shrink-0" aria-hidden>
          {marcas.map((m) => (
            <span
              key={m}
              className="absolute right-0 translate-y-1/2 text-[0.6875rem] tabular-nums text-app-text-secondary dark:text-gray-400"
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
            aria-label={`${titulo} acumulados cada ${INTERVALO_ACUMULADO_MIN} minutos. Usa las flechas izquierda y derecha para recorrer el tiempo.`}
            onKeyDown={onTecla}
            onFocus={() => onActivo(activo ?? n)}
            onBlur={() => onActivo(null)}
            onMouseMove={onMouseMove}
            onMouseLeave={() => onActivo(null)}
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
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden
            >
              {/* El total se dibuja al final para quedar encima. */}
              {[...lineas].reverse().map((l) => (
                <polyline
                  key={l.label}
                  points={puntos.map((p, k) => `${x(k)},${y(p[l.campo])}`).join(" ")}
                  fill="none"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className={l.serie.stroke}
                />
              ))}
            </svg>
            {actual && activo != null ? (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-gray-300 dark:bg-gray-600"
                  style={{ left: `${x(activo)}%` }}
                  aria-hidden
                />
                {lineas.map((l) => (
                  <span
                    key={l.label}
                    className={`pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-[#202124] ${l.serie.fill}`}
                    style={{ left: `${x(activo)}%`, top: `${y(actual[l.campo])}%` }}
                    aria-hidden
                  />
                ))}
                <div
                  className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700"
                  style={{
                    left: `clamp(5.5rem, ${x(activo)}%, calc(100% - 5.5rem))`,
                  }}
                  aria-hidden
                >
                  <p className="mb-1 text-[0.6875rem] text-gray-300">
                    {titulo} hasta las {horaMinuto(actual.t)}
                  </p>
                  {lineas.map((l) => (
                    <p key={l.label} className="flex items-center gap-2">
                      <span className={`h-0.5 w-3 rounded-full ${l.serie.onDark}`} aria-hidden />
                      <span className="font-semibold tabular-nums">{actual[l.campo]}</span>
                      {l.label.toLowerCase()}
                      {anterior ? (
                        <span className="tabular-nums text-gray-300">
                          +{actual[l.campo] - anterior[l.campo]}
                        </span>
                      ) : null}
                    </p>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <div className="relative mt-1.5 h-8" aria-hidden>
            {etiquetasX.map((k, j) => {
              const previa = j > 0 ? puntos[etiquetasX[j - 1]] : null;
              const cambiaDia = !previa || dia(previa.t) !== dia(puntos[k].t);
              return (
                <span
                  key={k}
                  className="absolute -translate-x-1/2 whitespace-nowrap text-center text-[0.6875rem] leading-tight text-app-text-secondary dark:text-gray-400"
                  style={{ left: `${x(k)}%` }}
                >
                  {hora(puntos[k].t)}
                  {cambiaDia ? <span className="block">{dia(puntos[k].t)}</span> : null}
                </span>
              );
            })}
          </div>
        </div>
        <div className="relative h-44 w-10 shrink-0" aria-hidden>
          {lineas.map((l, i) => (
            <span
              key={l.label}
              className="absolute left-0 flex -translate-y-1/2 items-center gap-1 text-[0.6875rem] font-medium tabular-nums text-app-text-primary dark:text-gray-200"
              style={{ top: `${etiquetasY[i]}%` }}
            >
              <span className={`h-0.5 w-2 rounded-full ${l.serie.fill}`} />
              {ultimo[l.campo]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface CrecimientoAcumuladoProps {
  puntos: PuntoAcumulado[];
  recortado: boolean;
}

/**
 * Línea de tiempo con los registros y check-ins acumulados cada `INTERVALO_ACUMULADO_MIN`
 * minutos, en dos paneles
 * con la misma escala (registros | check-ins), cada uno con total, hombres y mujeres.
 * Van separados porque registros y check-ins casi siempre corren juntos y en una sola
 * gráfica las líneas quedarían encimadas. El cursor se comparte entre los dos paneles;
 * el tooltip trae el acumulado y lo que se sumó en ese intervalo, y la tabla, todo.
 */
export function CrecimientoAcumulado({ puntos, recortado }: CrecimientoAcumuladoProps) {
  const [activo, setActivo] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const n = puntos.length - 1;
  const ultimo = n >= 0 ? puntos[n] : null;
  const { tope, marcas } = escalaEje(ultimo ? Math.max(ultimo.registros, ultimo.checkins) : 0);

  // Etiquetas del eje X solo en horas en punto, unas 5 por panel.
  const enPunto = puntos.flatMap((p, k) => (new Date(p.t).getMinutes() === 0 ? [k] : []));
  const cadaN = Math.max(1, Math.ceil(enPunto.length / 5));
  const etiquetasX = enPunto.filter((_, j) => j % cadaN === 0);

  const conCambio = puntos.filter(
    (p, k) =>
      k > 0 &&
      (p.registros !== puntos[k - 1].registros || p.checkins !== puntos[k - 1].checkins),
  );
  const actual = activo != null ? puntos[activo] : null;

  const onTecla = (e: React.KeyboardEvent) => {
    if (n < 0) return;
    const base = activo ?? n;
    const siguiente =
      e.key === "ArrowLeft"
        ? Math.max(0, base - 1)
        : e.key === "ArrowRight"
          ? Math.min(n, base + 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n
              : null;
    if (siguiente == null) return;
    e.preventDefault();
    setActivo(siguiente);
  };

  const subtitle = (
    <>
      {recortado
        ? `Acumulado cada ${INTERVALO_ACUMULADO_MIN} minutos, últimas 48 horas con actividad.`
        : `Acumulado cada ${INTERVALO_ACUMULADO_MIN} minutos, de la primera a la última actividad.`}
      {ultimo
        ? ` Van ${ultimo.registros} registros y ${ultimo.checkins} check-ins.`
        : ""}
    </>
  );

  const panel = { puntos, tope, marcas, etiquetasX, activo, onActivo: setActivo, onTecla };

  return (
    <ChartCard
      title="Crecimiento de registros y check-ins"
      subtitle={subtitle}
      aside={
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          disabled={puntos.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-app-text-primary transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
        >
          <HugeiconsIcon icon={verTabla ? ChartLineData01Icon : TableIcon} size={14} />
          {verTabla ? "Ver gráfica" : "Ver tabla"}
        </button>
      }
    >
      {puntos.length === 0 ? (
        <SinDatos>Todavía no hay registros ni check-ins.</SinDatos>
      ) : verTabla ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {`Registros y check-ins acumulados cada ${INTERVALO_ACUMULADO_MIN} minutos`}
            </caption>
            <thead className="sticky top-0 bg-white dark:bg-[#202124]">
              <tr className="text-[0.6875rem] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                <th scope="col" rowSpan={2} className="pb-2 text-left align-bottom">
                  Hasta
                </th>
                <th scope="colgroup" colSpan={3} className="pb-1 text-right">
                  Registros
                </th>
                <th scope="colgroup" colSpan={3} className="pb-1 text-right">
                  Check-ins
                </th>
              </tr>
              <tr className="text-[0.6875rem] font-medium text-app-text-secondary dark:text-gray-400">
                {[0, 1].flatMap((g) =>
                  ["Total", "Hombres", "Mujeres"].map((col) => (
                    <th key={`${g}-${col}`} scope="col" className="pb-2 pl-3 text-right">
                      {col}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {conCambio.map((p) => (
                <tr key={p.t}>
                  <th
                    scope="row"
                    className="py-1.5 text-left font-normal text-app-text-primary dark:text-gray-200"
                  >
                    {dia(p.t)}, {horaMinuto(p.t)}
                  </th>
                  {(
                    [
                      "registros",
                      "registrosH",
                      "registrosM",
                      "checkins",
                      "checkinsH",
                      "checkinsM",
                    ] as const
                  ).map((campo, i) => (
                    <td
                      key={campo}
                      className={`py-1.5 pl-3 text-right tabular-nums ${
                        i % 3 === 0
                          ? "font-medium text-app-text-primary dark:text-gray-200"
                          : "text-app-text-secondary dark:text-gray-400"
                      }`}
                    >
                      {p[campo]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <PanelLineas titulo="Registros" medida="registros" {...panel} />
            <PanelLineas titulo="Check-ins" medida="checkins" {...panel} />
          </div>
          <p className="sr-only" aria-live="polite">
            {actual
              ? `Hasta las ${horaMinuto(actual.t)}: ${actual.registros} registros (${desglose(actual, "registros")}), ${actual.checkins} check-ins (${desglose(actual, "checkins")})`
              : ""}
          </p>
        </>
      )}
    </ChartCard>
  );
}
