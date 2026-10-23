"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import {
  ENCONTRADOS_QUERY,
  type EncontradoListItem,
  type EncontradosQueryResponse,
  type EncontradosQueryVariables,
} from "registro/graphql/encontrados/queries";
import { getGlassCardClass } from "registro/components/shared/FormInputStyles";

function fullName(e: EncontradoListItem): string {
  const parts = [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean);
  return parts.join(" ").trim() || "Sin nombre";
}

function formatHora(d: Date): string {
  return d.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * "10:42 a. m." si es de hoy; "23 oct, 10:42 a. m." si es de otro día.
 * Con `soloHora` siempre devuelve solo la hora (el día ya se mostró al lado).
 */
function formatMomento(
  iso: string | null | undefined,
  soloHora = false,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hora = formatHora(d);
  if (soloHora || d.toDateString() === new Date().toDateString()) return hora;
  const dia = d.toLocaleDateString("es", { day: "numeric", month: "short" });
  return `${dia}, ${hora}`;
}

/**
 * Coincidencia por nombre o por clave: "H12" / "m3" (sexo + número) o solo el número.
 */
function matchesSearch(e: EncontradoListItem, searchNorm: string): boolean {
  if (fullName(e).toLowerCase().includes(searchNorm)) return true;
  const clave = String(e.clave ?? "").replace(/\s+/g, "");
  const sexo = (e.sexo ?? "").toUpperCase();
  if (!clave || !["H", "M"].includes(sexo)) return false;
  const conSexo = searchNorm.match(/^([hm])(\d+)$/i);
  if (conSexo) {
    return conSexo[1].toUpperCase() === sexo && conSexo[2] === clave;
  }
  return /^\d+$/.test(searchNorm) && searchNorm === clave;
}

export interface RegistrosListProps {
  userId: string | undefined;
  onEdit?: (id: string) => void;
  className?: string;
}

/**
 * Panel con los encontrados que registró el usuario actual, del más reciente al
 * más antiguo: nombre, hora de registro, estado de check-in y clave (color por
 * sexo). Cada fila abre la edición del registro. La lista tiene su propio
 * scroll para que el panel quede fijo junto al formulario.
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

  if (!userId) return null;

  const all = data?.encontrados ?? [];
  const searchNorm = search.trim().toLowerCase();
  const list = searchNorm
    ? all.filter((e) => matchesSearch(e, searchNorm))
    : all;

  let body: React.ReactNode;
  if (loading && !data) {
    body = (
      <div className="flex flex-col gap-2" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[4.25rem] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  } else if (error && !data) {
    body = (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudieron cargar tus registros.
      </p>
    );
  } else if (list.length === 0) {
    body = (
      <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-app-text-secondary dark:border-gray-600 dark:text-gray-400">
        {searchNorm
          ? "Ningún registro coincide con la búsqueda."
          : "Aquí aparecerán las personas que registres."}
      </p>
    );
  } else {
    body = (
      <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 py-1">
        {list.map((encontrado) => {
          const sexo = encontrado.sexo === "M" ? "M" : "H";
          const checkinAt = encontrado.checkins?.checkinAt ?? null;
          return (
            <li key={encontrado.id}>
              <button
                type="button"
                onClick={onEdit ? () => onEdit(encontrado.id) : undefined}
                disabled={!onEdit}
                title={onEdit ? "Editar registro" : undefined}
                className={getGlassCardClass(sexo, {
                  interactive: !!onEdit,
                  className:
                    "flex w-full items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/60 disabled:cursor-default",
                })}
              >
                <span className="min-w-0">
                  <span
                    className="block truncate font-medium"
                    title={fullName(encontrado)}
                  >
                    {fullName(encontrado)}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-app-text-secondary dark:text-gray-400">
                    <span>{formatMomento(encontrado.create_at)}</span>
                    <span aria-hidden>·</span>
                    {checkinAt ? (
                      <span className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-green-400">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={12}
                          aria-hidden
                        />
                        Check-in {formatMomento(checkinAt, true)}
                      </span>
                    ) : (
                      <span>Sin check-in</span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {sexo}
                  {encontrado.clave}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section
      aria-labelledby="mis-registros-title"
      className={`flex min-h-0 flex-col gap-3 ${className ?? ""}`.trim()}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="mis-registros-title"
          className="text-lg font-semibold tracking-tight text-app-text-primary dark:text-white"
        >
          Mis registros
        </h2>
        <span className="text-sm tabular-nums text-app-text-secondary dark:text-gray-400">
          {searchNorm ? `${list.length} de ${all.length}` : all.length}
        </span>
      </div>
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre o clave (H1, M3)"
          className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-app-text-primary placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none focus:ring-1 focus:ring-app-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
          aria-label="Buscar en mis registros por nombre o clave"
        />
      </div>
      {body}
    </section>
  );
}
