"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
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

export interface CheckinEncontradoSelectorProps {
  userId: string;
  selectedId: string | null;
  onSelect: (encontrado: EncontradoListItem) => void;
  /** Sexo del seleccionado para borde (H = azul, M = rosa). */
  sexo?: "H" | "M";
  /** Filtrar lista por sexo (null = todos). */
  sexoFilter?: "H" | "M" | null;
  className?: string;
}

/**
 * Selector de encontrado para check-in: búsqueda por nombre y tabla de registros.
 */
export function CheckinEncontradoSelector({
  userId,
  selectedId,
  onSelect,
  sexo = "H",
  sexoFilter = null,
  className,
}: CheckinEncontradoSelectorProps) {
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search.trim().toLowerCase());
      setPage(1);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const take = 10;
  const skip = (page - 1) * take;
  const searchNorm = searchDebounced;

  const where = (() => {
    const base: EncontradosQueryVariables["where"] = {};
    if (userId) base.user = { id: { equals: userId } };
    if (sexoFilter) base.sexo = { equals: sexoFilter };
    if (!searchNorm) return base;
    return {
      ...base,
      OR: [
        { nombre: { contains: searchNorm, mode: "insensitive" } },
        { apellido_p: { contains: searchNorm, mode: "insensitive" } },
        { apellido_m: { contains: searchNorm, mode: "insensitive" } },
      ],
    };
  })();

  const { data, loading, error } = useQuery<
    EncontradosQueryResponse,
    EncontradosQueryVariables
  >(ENCONTRADOS_QUERY, {
    variables: {
      where,
      take,
      skip,
    },
    skip: !userId,
  });

  const list = data?.encontrados ?? [];
  const total = data?.encontradosCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);

  const handleSearchChange = (value: string) => setSearch(value);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const borderClass =
    sexo === "M"
      ? "border-pink-500 focus:ring-pink-500/30 dark:border-pink-400"
      : "border-app-primary focus:ring-app-primary/30";

  return (
    <div className={className}>
      <div className="relative mb-3">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nombre"
          className={`w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 ${borderClass}`}
          aria-label="Buscar por nombre"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar registros
        </p>
      ) : list.length === 0 && !loading ? (
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          {searchNorm ? "Ningún registro coincide" : "No hay registros"}
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
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Nombre
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Edad
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Clave
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => {
                const isSelected = selectedId === e.id;
                const isHombre = e.sexo === "H";
                const rowClass = isSelected
                  ? isHombre
                    ? "bg-app-primary/10 ring-inset ring-2 ring-app-primary dark:bg-app-primary-muted/20"
                    : "bg-pink-500/10 ring-inset ring-2 ring-pink-500 dark:bg-pink-500/20"
                  : isHombre
                    ? "hover:bg-app-primary/5 dark:hover:bg-app-primary-muted/10 text-app-text-primary"
                    : "hover:bg-pink-500/5 dark:hover:bg-pink-500/10 text-app-text-primary";
                return (
                  <tr
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(e)}
                    onKeyDown={(ev) =>
                      (ev.key === "Enter" || ev.key === " ") && onSelect(e)
                    }
                    className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 dark:border-gray-700/80 ${rowClass}`}
                  >
                    <td className="px-4 py-3 font-medium">{fullName(e)}</td>
                    <td className="px-4 py-3 font-medium">{e.edad} años</td>
                    <td
                      className={`px-4 py-3 font-semibold ${isHombre ? "text-app-primary dark:text-app-primary-muted" : "text-pink-600 dark:text-pink-400"}`}
                    >
                      {e.sexo}
                      {e.clave ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            {from}-{to} de {total} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Página anterior"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Anterior
            </button>
            <span className="px-2 text-sm text-app-text-secondary dark:text-gray-400">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Página siguiente"
            >
              Siguiente
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
