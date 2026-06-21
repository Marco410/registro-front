"use client";

import { useQuery } from "@apollo/client";
import { AnimatedMount } from "registro/components/shared";
import {
  ENCONTRADOS_ESTADO_C_QUERY,
  ESTADO_C_OPTIONS,
  type EncontradosEstadoCQueryResponse,
} from "registro/graphql/encontrados/queries";
import {
  buildEncontradosWhere,
  filterEncontradosEnForo,
  useBajaEncontradoIds,
} from "./use-baja-encontrado-ids";

const CARD_BASE =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#202124]";

function cardAccent(sex: "H" | "M" | null): string {
  if (sex === "H")
    return "border-l-4 border-l-app-primary dark:border-l-app-primary-muted";
  if (sex === "M") return "border-l-4 border-l-pink-500 dark:border-l-pink-400";
  return "border-l-4 border-l-gray-400 dark:border-l-gray-500";
}

function titleClass(sex: "H" | "M" | null): string {
  if (sex === "H")
    return "text-sm font-medium text-app-primary dark:text-app-primary-muted";
  if (sex === "M")
    return "text-sm font-medium text-pink-600 dark:text-pink-400";
  return "text-sm font-medium text-app-text-secondary dark:text-gray-400";
}

function valueClass(sex: "H" | "M" | null): string {
  if (sex === "H")
    return "tabular-nums font-medium text-app-primary dark:text-app-primary-muted";
  if (sex === "M")
    return "tabular-nums font-medium text-pink-600 dark:text-pink-400";
  return "tabular-nums font-medium text-app-text-primary dark:text-gray-200";
}

function aggregate(
  encontrados: { estado_c: string }[],
): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  const opts = new Set(ESTADO_C_OPTIONS);
  for (const e of encontrados) {
    const raw = e.estado_c?.trim() || "Sin especificar";
    const key = opts.has(raw as (typeof ESTADO_C_OPTIONS)[number])
      ? raw
      : "Otro";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

export interface EstadoCivilCountsProps {
  sex?: "H" | "M" | null;
}

function titleFor(sex: "H" | "M" | null): string {
  if (sex === "H") return "Estado civil en el retiro (Hombres)";
  if (sex === "M") return "Estado civil en el retiro (Mujeres)";
  return "Estado civil en el retiro";
}

export function EstadoCivilCounts({ sex = null }: EstadoCivilCountsProps) {
  const where = buildEncontradosWhere(sex);
  const {
    bajaIds,
    loading: loadingBajas,
    error: errorBajas,
  } = useBajaEncontradoIds(sex);
  const { data, loading, error } = useQuery<EncontradosEstadoCQueryResponse>(
    ENCONTRADOS_ESTADO_C_QUERY,
    { variables: { where }, pollInterval: 10000 },
  );

  if (loading || loadingBajas) {
    return (
      <div className={`${CARD_BASE} ${cardAccent(sex)}`}>
        <p className={titleClass(sex)}>{titleFor(sex)}</p>
        <div className="mt-3 h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
      </div>
    );
  }

  if (error || errorBajas) {
    return (
      <div className={`${CARD_BASE} ${cardAccent(sex)}`}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar estado civil
        </p>
      </div>
    );
  }

  const enForo = filterEncontradosEnForo(data?.encontrados ?? [], bajaIds);
  const rows = aggregate(enForo);

  return (
    <AnimatedMount show={true} animationKey="estado-civil-counts">
      <div className={`${CARD_BASE} ${cardAccent(sex)}`}>
        <p className={titleClass(sex)}>{titleFor(sex)}</p>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
            Sin datos
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {rows.map(({ name, value }) => (
              <li
                key={name}
                className="flex justify-between text-sm text-app-text-primary dark:text-gray-200"
              >
                <span>{name}</span>
                <span className={valueClass(sex)}>
                  {value.toLocaleString("es")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AnimatedMount>
  );
}
