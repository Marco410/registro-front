"use client";

import { useId, type ReactNode } from "react";

/**
 * Colores de serie, validados con el validador de paletas (CVD, contraste y banda de
 * luminosidad) contra la superficie clara (#fff) y la oscura (#202124). Hombres y
 * mujeres usan los colores de la app; registros/check-ins usan otra pareja para no
 * confundirse con el sexo. Los cuatro se validaron juntos (todos los pares) porque en
 * "Actividad por hora" registros queda junto a hombres: el morado de antes se confundía
 * con el azul. Ámbar/verde queda en 7.3 de ΔE con daltonismo, aceptable porque nunca van
 * juntos y la posición y la tabla los distinguen. El texto nunca usa estos colores: la
 * identidad la da la muestra junto a la etiqueta.
 */
export const SERIES = {
  H: {
    label: "Hombres",
    fill: "bg-[#1A73E8] dark:bg-[#3b82f6]",
    stroke: "stroke-[#1A73E8] dark:stroke-[#3b82f6]",
    onDark: "bg-[#3b82f6]",
  },
  M: {
    label: "Mujeres",
    fill: "bg-[#ec4899]",
    stroke: "stroke-[#ec4899]",
    onDark: "bg-[#ec4899]",
  },
  registros: {
    label: "Registros",
    fill: "bg-[#b45309] dark:bg-[#d97706]",
    stroke: "stroke-[#b45309] dark:stroke-[#d97706]",
    onDark: "bg-[#d97706]",
  },
  checkins: {
    label: "Check-ins",
    fill: "bg-[#16a34a]",
    stroke: "stroke-[#16a34a]",
    onDark: "bg-[#16a34a]",
  },
} as const;
// `stroke` es para líneas (SVG); `onDark`, para las muestras del tooltip, que siempre es oscuro.

export type SerieKey = keyof typeof SERIES;

/** Leyenda (siempre presente con 2 o más series): muestra rectangular + etiqueta. */
export function Leyenda({ series }: { series: SerieKey[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-secondary dark:text-gray-400">
      {series.map((key) => (
        <li key={key} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-[2px] ${SERIES[key].fill}`}
            aria-hidden
          />
          {SERIES[key].label}
        </li>
      ))}
    </ul>
  );
}

/** Paso "redondo" (1, 2, 5 × 10ⁿ) para unas 4 marcas del eje. */
export function pasoRedondo(max: number): number {
  if (max <= 4) return 1;
  const crudo = max / 4;
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const n = crudo / potencia;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * potencia;
}

/** Tope del eje (múltiplo del paso) y sus marcas, desde 0. */
export function escalaEje(maxValor: number): { tope: number; marcas: number[] } {
  const paso = pasoRedondo(Math.max(1, maxValor));
  const tope = Math.max(paso, Math.ceil(maxValor / paso) * paso);
  const marcas = Array.from({ length: tope / paso + 1 }, (_, i) => i * paso);
  return { tope, marcas };
}

/** Contenedor de cada gráfica: título, subtítulo, leyenda y acciones arriba. */
export function ChartCard({
  title,
  subtitle,
  aside,
  children,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-base font-semibold text-app-text-primary dark:text-white"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-app-text-secondary dark:text-gray-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {aside ? <div className="flex items-center gap-3">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function SinDatos({ children = "Sin datos para mostrar." }: { children?: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-app-text-secondary dark:border-gray-600 dark:text-gray-400">
      {children}
    </p>
  );
}

/**
 * Barra horizontal apilada H|M: crece desde la izquierda, extremo de datos redondeado
 * (4px) y 2px de superficie entre segmentos. `max` escala todas las filas igual.
 */
export function BarraHM({
  hombres,
  mujeres,
  max,
}: {
  hombres: number;
  mujeres: number;
  max: number;
}) {
  const total = hombres + mujeres;
  if (total === 0 || max === 0) return <div className="h-3" aria-hidden />;
  return (
    <div
      className="flex h-3 items-stretch gap-[2px]"
      style={{ width: `${(total / max) * 100}%` }}
      aria-hidden
    >
      {hombres > 0 ? (
        <span
          className={`min-w-[2px] ${SERIES.H.fill} ${mujeres > 0 ? "" : "rounded-r-[4px]"}`}
          style={{ flex: `${hombres} 1 0` }}
        />
      ) : null}
      {mujeres > 0 ? (
        <span
          className={`min-w-[2px] rounded-r-[4px] ${SERIES.M.fill}`}
          style={{ flex: `${mujeres} 1 0` }}
        />
      ) : null}
    </div>
  );
}
