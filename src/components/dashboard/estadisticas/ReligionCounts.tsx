"use client";

import { useQuery } from "@apollo/client";
import { AnimatedMount } from "registro/components/shared";
import {
  ENCONTRADOS_RELIGION_QUERY,
  type EncontradosReligionQueryResponse,
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
  encontrados: { religion: string | null }[],
): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const e of encontrados) {
    const raw = e.religion?.trim() || "Sin especificar";
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export interface ReligionCountsProps {
  sex?: "H" | "M" | null;
}

function titleFor(sex: "H" | "M" | null): string {
  if (sex === "H") return "Religión en el retiro (Hombres)";
  if (sex === "M") return "Religión en el retiro (Mujeres)";
  return "Religión en el retiro";
}

export function ReligionCounts({ sex = null }: ReligionCountsProps) {
  const where = buildEncontradosWhere(sex);
  const {
    bajaIds,
    loading: loadingBajas,
    error: errorBajas,
  } = useBajaEncontradoIds(sex);
  const { data, loading, error } = useQuery<EncontradosReligionQueryResponse>(
    ENCONTRADOS_RELIGION_QUERY,
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
          Error al cargar religión
        </p>
      </div>
    );
  }

  const enForo = filterEncontradosEnForo(data?.encontrados ?? [], bajaIds);
  const rows = aggregate(enForo);

  return (
    <AnimatedMount show={true} animationKey="religion-counts">
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
