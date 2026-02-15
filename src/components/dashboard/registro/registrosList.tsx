"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  ENCONTRADOS_QUERY,
  type EncontradoListItem,
  type EncontradosQueryResponse,
  type EncontradosQueryVariables,
} from "registro/graphql/encontrados/queries";

function fullName(e: EncontradoListItem): string {
  const parts = [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean);
  return parts.join(" ").trim() || "Sin nombre";
}

export interface RegistrosListProps {
  userId: string | undefined;
  onEdit?: (id: string) => void;
  className?: string;
}

/**
 * Lista de encontrados del usuario actual, mostrados como badges (nombre, clave)
 * con color por sexo (azul H, rosa M) y botón editar.
 */
export function RegistrosList({
  userId,
  onEdit,
  className,
}: RegistrosListProps) {
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery<
    EncontradosQueryResponse,
    EncontradosQueryVariables
  >(ENCONTRADOS_QUERY, {
    variables: {
      where: {
        user: userId ? { id: { equals: userId } } : undefined,
      },
    },
    skip: !userId,
  });

  const all = data?.encontrados ?? [];
  const searchNorm = search.trim().toLowerCase();
  const list = searchNorm
    ? all.filter((e) => fullName(e).toLowerCase().includes(searchNorm))
    : all;

  if (!userId) return null;

  if (loading) {
    return (
      <div className={className}>
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          Cargando registros…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar registros
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
          Registros recientes ({list.length})
        </h2>
        <div className="relative shrink-0 sm:w-56">
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
            aria-label="Buscar registros por nombre"
          />
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          {searchNorm
            ? "Ningún registro coincide con la búsqueda"
            : "Aún no hay registros"}
        </p>
      ) : (
        <div className={`flex flex-wrap gap-3 ${className ?? ""}`.trim()}>
          {list.map((encontrado) => {
            const isHombre = encontrado.sexo === "H";
            const badgeClass = isHombre
              ? "border-app-primary text-app-primary dark:bg-app-primary-muted/20 dark:border-app-primary-muted dark:text-app-primary-muted"
              : "border-rose-500 text-rose-600 dark:bg-rose-500/20 dark:border-rose-400 dark:text-rose-400";
            return (
              <div
                key={encontrado.id}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${badgeClass}`}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(encontrado.id)}
                    className="rounded-lg p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                    aria-label={`Editar ${fullName(encontrado)}`}
                  >
                    <HugeiconsIcon icon={Edit01Icon} size={18} />
                  </button>
                )}
                <span className="font-medium">{fullName(encontrado)}</span>
                <span className="opacity-90">·</span>
                <span className="text-sm font-semibold">
                  Clave: {encontrado.sexo}
                  {encontrado.clave}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
