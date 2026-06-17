"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import {
  USERS_QUERY,
  type UserListItem,
  type UsersQueryResponse,
} from "registro/graphql/users/queries";
import { AnimatedMount } from "registro/components/shared";

type SortColumn = "registros" | "mediaRegistro" | "checkins" | "mediaCheckin";
type SortDir = "asc" | "desc";

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fullName(u: UserListItem): string {
  const parts = [u.name, u.lastName].filter(Boolean);
  return parts.join(" ").trim() || "—";
}

/**
 * Promedio de intervalo entre fechas consecutivas (en ms). Ordena por fecha y promedia las diferencias.
 * Devuelve null si hay menos de 2 fechas.
 */
function averageIntervalMs(dates: string[]): number | null {
  if (dates.length < 2) return null;
  const sorted = [...dates].map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  let sum = 0;
  for (let i = 1; i < sorted.length; i++) {
    sum += sorted[i]! - sorted[i - 1]!;
  }
  return sum / (sorted.length - 1);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60_000);
  if (min < 60) return sec > 0 ? `${min} min ${sec} s` : `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function getAverageRegistroDisplay(u: UserListItem): string {
  const dates = (u.encontrados ?? []).map((e) => e.create_at).filter(Boolean);
  const avg = averageIntervalMs(dates);
  return avg != null ? formatDuration(avg) : "—";
}

function getAverageCheckinDisplay(u: UserListItem): string {
  const dates = (u.checkins ?? []).map((c) => c.checkinAt).filter(Boolean);
  const avg = averageIntervalMs(dates);
  return avg != null ? formatDuration(avg) : "—";
}

function getAverageRegistroMs(u: UserListItem): number | null {
  const dates = (u.encontrados ?? []).map((e) => e.create_at).filter(Boolean);
  return averageIntervalMs(dates);
}

function getAverageCheckinMs(u: UserListItem): number | null {
  const dates = (u.checkins ?? []).map((c) => c.checkinAt).filter(Boolean);
  return averageIntervalMs(dates);
}

export default function DashboardUsuariosPage() {
  const { data, loading, error } = useQuery<UsersQueryResponse>(USERS_QUERY);
  const [sortBy, setSortBy] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rawList = data?.users ?? [];

  const list = useMemo(() => {
    if (!sortBy) return rawList;
    const sorted = [...rawList].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      switch (sortBy) {
        case "registros":
          aVal = a.encontradosCount;
          bVal = b.encontradosCount;
          break;
        case "mediaRegistro": {
          const aMs = getAverageRegistroMs(a);
          const bMs = getAverageRegistroMs(b);
          aVal = aMs ?? -1;
          bVal = bMs ?? -1;
          break;
        }
        case "checkins":
          aVal = a.checkinsCount;
          bVal = b.checkinsCount;
          break;
        case "mediaCheckin": {
          const aMs = getAverageCheckinMs(a);
          const bMs = getAverageCheckinMs(b);
          aVal = aMs ?? -1;
          bVal = bMs ?? -1;
          break;
        }
        default:
          return 0;
      }
      const cmp = aVal - bVal;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rawList, sortBy, sortDir]);

  const toggleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortColumn;
    label: string;
  }) => (
    <th className="px-4 py-2 font-semibold text-app-text-primary dark:text-gray-300">
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1 rounded-md py-0.5 pr-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={`Ordenar por ${label}`}
      >
        {label}
        {sortBy === column ? (
          <HugeiconsIcon
            icon={sortDir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
            size={14}
            className="shrink-0"
          />
        ) : (
          <span className="inline-block w-[14px]" aria-hidden />
        )}
      </button>
    </th>
  );

  return (
    <div className="w-full max-w-6xl">
      <div className="border-l-4 border-app-primary pl-4">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Listado con registros, check-ins y tiempo medio por registro y por
          check-in.
        </p>
      </div>

      <AnimatedMount show={true} animationKey="usuarios-list">
        <div className="mt-8">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar usuarios
            </p>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              {loading && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-gray-900/80"
                  aria-hidden="true"
                >
                  <span className="text-sm font-medium text-app-text-secondary dark:text-gray-400">
                    Cargando…
                  </span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm bg-white dark:bg-gray-900">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                      <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                        Nombre
                      </th>
                      <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                        Usuario
                      </th>
                      <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                        Teléfono
                      </th>
                      <SortHeader column="registros" label="Registros" />
                      <SortHeader column="mediaRegistro" label="Media por registro" />
                      <SortHeader column="checkins" label="Check-ins" />
                      <SortHeader column="mediaCheckin" label="Media por check-in" />
                      <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                        Alta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 && !loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-sm text-app-text-secondary dark:text-gray-400"
                        >
                          No hay usuarios
                        </td>
                      </tr>
                    ) : (
                      list.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700/80 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 font-medium text-app-text-primary dark:text-gray-200">
                            {fullName(u)}
                          </td>
                          <td className="px-4 py-3 text-app-text-secondary dark:text-gray-400">
                            {u.username || "—"}
                          </td>
                          <td className="px-4 py-3 text-app-text-secondary dark:text-gray-400">
                            {u.phone || "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-app-text-primary dark:text-gray-300">
                            {u.encontradosCount}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-app-text-primary dark:text-gray-300">
                            {getAverageRegistroDisplay(u)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-app-text-primary dark:text-gray-300">
                            {u.checkinsCount}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-app-text-primary dark:text-gray-300">
                            {getAverageCheckinDisplay(u)}
                          </td>
                          <td className="px-4 py-3 text-app-text-secondary dark:text-gray-400">
                            {formatCreatedAt(u.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {list.length > 0 && !error && (
            <p className="mt-3 text-sm text-app-text-secondary dark:text-gray-400">
              {list.length} usuario{list.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </AnimatedMount>
    </div>
  );
}
