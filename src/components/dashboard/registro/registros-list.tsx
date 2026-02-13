"use client";

import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
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
 * con color por sexo (azul M, rosa F) y botón editar.
 */
export function RegistrosList({
  userId,
  onEdit,
  className,
}: RegistrosListProps) {
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

  const list = data?.encontrados ?? [];

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

  if (list.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          Aún no hay registros
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ""}`.trim()}>
      {list.map((encontrado) => {
        const isMale = encontrado.sexo === "M";
        const badgeClass = isMale
          ? "border-app-primary bg-app-primary/10 text-app-primary dark:bg-app-primary-muted/20 dark:border-app-primary-muted dark:text-app-primary-muted"
          : "border-rose-500 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:border-rose-400 dark:text-rose-400";
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
            <span className="text-sm font-semibold">{encontrado.clave}</span>
          </div>
        );
      })}
    </div>
  );
}
