"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import {
  CHECKINS_QUERY,
  type CheckinListItem,
  type CheckinsQueryResponse,
  type CheckinsQueryVariables,
} from "registro/graphql/checkin/queries";
import { PerformCheckinResponse } from "registro/graphql/checkin/mutations";

function fullName(c: CheckinListItem): string {
  const e = c.encontrado;
  if (!e) return "Sin nombre";
  const parts = [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean);
  return parts.join(" ").trim() || "Sin nombre";
}

function formatCheckinDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleDateString("es", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year} ${time}`;
  } catch {
    return iso;
  }
}

export interface CheckinsListProps {
  userId: string | undefined;
  onSelect?: (checkin: CheckinListItem) => void;
  className?: string;
  checkinSelected?: PerformCheckinResponse["performCheckin"] | null;
}

/**
 * Lista de check-ins realizados por el usuario: nombre del encontrado, fecha y quién lo registró.
 * Búsqueda por nombre y color por sexo (azul H, rosa M).
 */
export function CheckinsList({ userId, onSelect, className, checkinSelected }: CheckinsListProps) {
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery<
    CheckinsQueryResponse,
    CheckinsQueryVariables
  >(CHECKINS_QUERY, {
    variables: {
      where: userId ? { user: { id: { equals: userId } } } : {},
    },
    skip: !userId,
  });

  const all = data?.checkins ?? [];
  const searchNorm = search.trim().toLowerCase();
  const list = searchNorm
    ? all.filter((c) => fullName(c).toLowerCase().includes(searchNorm))
    : all;

  if (!userId) return null;

  if (loading) {
    return (
      <div className={className}>
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          Cargando check-ins…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar check-ins
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-app-text-primary dark:text-white sm:text-2xl">
          Mis check-ins ({list.length})
        </h2>
        <div className="relative shrink-0 sm:w-52">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre"
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-app-text-primary placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none focus:ring-1 focus:ring-app-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
            aria-label="Buscar check-ins por nombre del encontrado"
          />
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          {searchNorm
            ? "Ningún check-in coincide con la búsqueda"
            : "Aún no hay check-ins"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => {
            const isHombre = c.encontrado?.sexo === "H";
            const badgeClass = isHombre
              ? "border-app-primary text-app-primary dark:bg-app-primary-muted/20 dark:border-app-primary-muted dark:text-app-primary-muted"
              : "border-pink-500 text-pink-600 dark:bg-pink-500/20 dark:border-pink-400 dark:text-pink-400";
            const registradoPor = c.encontrado?.user?.name ?? "—";
            const isSelected = checkinSelected?.checkin?.id === c.id;
            return (
              <div
                key={c.id}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(c) : undefined}
                onKeyDown={
                  onSelect
                    ? (ev) =>
                        (ev.key === "Enter" || ev.key === " ") && onSelect(c)
                    : undefined
                }
                className={`rounded-xl border px-4 py-3 flex flex-row justify-between ${badgeClass} ${onSelect ? "cursor-pointer transition-opacity hover:opacity-90" : ""} ${isSelected ? "bg-app-primary/10  dark:bg-app-primary-muted/20" : ""}`.trim()}
              >
                <div>
                  <p className="font-medium">{fullName(c)}</p>
                  <p className="mt-1 text-sm opacity-90">
                    {formatCheckinDate(c.checkinAt)}
                  </p>
                  <div className="flex flex-row gap-2">
                    <p className="mt-0.5 text-xs opacity-80 text-app-text-secondary">
                      Registrado por: <span className="font-bold">{registradoPor}</span>
                    </p>
                    |
                    <p className="mt-0.5 text-xs opacity-80 text-app-text-secondary">
                      Check-in por: <span className="font-bold">{c.user?.name}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">
                    {c.encontrado?.sexo}
                    {c.team?.teamNumber}
                    {c.seat?.letter}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
