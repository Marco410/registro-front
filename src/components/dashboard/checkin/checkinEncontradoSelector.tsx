"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import {
  ENCONTRADOS_QUERY,
  buildEncontradoSearchWhere,
  type EncontradoListItem,
  type EncontradosQueryResponse,
  type EncontradosQueryVariables,
} from "registro/graphql/encontrados/queries";
import { AnimatedMount, SexoSelector } from "registro/components/shared";

function fullName(e: EncontradoListItem): string {
  const parts = [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean);
  return parts.join(" ").trim() || "Sin nombre";
}

function getCheckinAt(e: EncontradoListItem): string | null {
  return e.checkins?.checkinAt ?? null;
}

function formatCheckinAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

const ENCONTRADOS_PAGE_SIZE = 10;

function focusSearchInput(input: HTMLInputElement | null) {
  if (!input) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
    });
  });
}

function CheckinEncontradosTableSkeleton({
  rows = ENCONTRADOS_PAGE_SIZE,
}: {
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr
          key={i}
          className="border-b border-gray-100 last:border-b-0 dark:border-gray-700/80"
          aria-hidden
        >
          <td className="px-4 py-3">
            <div className="h-4 w-3/4 max-w-[180px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </td>
        </tr>
      ))}
    </>
  );
}

export interface CheckinEncontradoSelectorProps {
  userId: string;
  selectedId: string | null;
  onSelect: (encontrado: EncontradoListItem) => void;
  /** Sexo del seleccionado para borde (H = azul, M = rosa). */
  sexo?: "H" | "M";
  /** Filtrar lista por sexo (null = todos). */
  sexoFilter?: "H" | "M" | null;
  /** Callback al cambiar el filtro por sexo (muestra el control de filtro). */
  onSexoFilterChange?: (value: "H" | "M") => void;
  /** Enfoca el campo de búsqueda al mostrarse, deseleccionar o cambiar filtro de sexo. */
  autoFocusSearch?: boolean;
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
  onSexoFilterChange,
  autoFocusSearch = false,
  className,
}: CheckinEncontradoSelectorProps) {
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocusSearch) return;
    const input = searchInputRef.current;
    if (!input) return;

    let wasVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry?.isIntersecting ?? false;
        if (isVisible && !wasVisible) focusSearchInput(input);
        wasVisible = isVisible;
      },
      { threshold: 0.01 },
    );

    observer.observe(input);
    return () => observer.disconnect();
  }, [autoFocusSearch]);

  useEffect(() => {
    if (!autoFocusSearch || selectedId != null) return;
    focusSearchInput(searchInputRef.current);
  }, [autoFocusSearch, selectedId]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search.trim().toLowerCase());
      setPage(1);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const take = ENCONTRADOS_PAGE_SIZE;
  const skip = (page - 1) * take;
  const searchNorm = searchDebounced;

  const where = (() => {
    const base: EncontradosQueryVariables["where"] = {};
    if (sexoFilter) base.sexo = { equals: sexoFilter };
    const searchWhere = buildEncontradoSearchWhere(searchNorm);
    if (!searchWhere) return base;
    return { ...base, ...searchWhere };
  })();

  const { data, previousData, loading, error, refetch } = useQuery<
    EncontradosQueryResponse,
    EncontradosQueryVariables
  >(ENCONTRADOS_QUERY, {
    variables: {
      where,
      take,
      skip,
    },
    skip: !userId,
    notifyOnNetworkStatusChange: true,
  });

  const list = data?.encontrados ?? [];
  const total = data?.encontradosCount ?? previousData?.encontradosCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);
  const showSkeleton = loading && list.length === 0;
  const showEmpty = !loading && list.length === 0;

  const handleSearchChange = (value: string) => setSearch(value);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const accentSexo = sexoFilter ?? sexo;

  const inputBorderClass =
    accentSexo === "M"
      ? "border-gray-300 focus:border-pink-500 focus:ring-pink-500/30 dark:border-gray-600 dark:focus:border-pink-400"
      : "border-gray-300 focus:border-app-primary focus:ring-app-primary/30 dark:border-gray-600 dark:focus:border-app-primary-muted";

  return (
    <section className={className}>
      {onSexoFilterChange != null && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
            Seleccionar registro
          </h2>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Actualizar registros"
              className={`
                flex items-center justify-center rounded-lg border border-transparent
                p-2 transition-colors hover:bg-app-primary/10 focus:outline-none focus:ring-2
                ${sexo === "M" ? "focus:ring-pink-400/60" : "focus:ring-app-primary/40"}
                text-app-text-secondary dark:text-gray-400
              `}
              title="Actualizar registros"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={20}
                className="transition-transform group-hover:rotate-90"
                aria-hidden="true"
              />
            </button>
            <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
              Filtrar por sexo
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <SexoSelector
                value={sexoFilter ?? "H"}
                onChange={(e) => {
                  const value = e.target.value as "H" | "M";
                  onSexoFilterChange?.(value);
                  if (autoFocusSearch) {
                    focusSearchInput(searchInputRef.current);
                  }
                }}
                label=""
                className="!mb-0"
              />
            </div>
          </div>
        </div>
      )}
      <AnimatedMount
        show
        animationKey={'checkin-encontrado-selector'}
        className="space-y-6"
        >
        <div>
          <div className="relative mb-3">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre, ID o clave. Ejem: 'Juan Perez', 'H197', 'H5A'"
              className={`w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 ${inputBorderClass}`}
              aria-label="Buscar por nombre, ID o clave"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar registros
            </p>
          ) : (
            <div
              className="min-h-[528px] overflow-auto rounded-xl border border-gray-200 dark:border-gray-700"
              aria-busy={loading}
            >
              <table className="w-full bg-white text-left text-sm dark:bg-gray-900">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                      Edad
                    </th>
                    <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                      ID
                    </th>
                    <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                      Check-in
                    </th>
                    <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                      Clave
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    <CheckinEncontradosTableSkeleton />
                  ) : showEmpty ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-app-text-secondary dark:text-gray-400"
                      >
                        {searchNorm
                          ? "Ningún registro coincide"
                          : "No hay registros"}
                      </td>
                    </tr>
                  ) : (
                    list.map((e) => {
                      const isSelected = selectedId === e.id;
                      const isHombre = e.sexo === "H";
                      const checkinAt = getCheckinAt(e);
                      const rowClass = isSelected
                        ? isHombre
                          ? "bg-app-primary/10 ring-inset ring-2 ring-app-primary dark:bg-app-primary-muted/20 rounded-xl"
                          : "bg-pink-500/10 ring-inset ring-2 ring-pink-500 dark:bg-pink-500/20 rounded-xl"
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
                            className={`px-4 py-3 font-semibold text-app-text-secondary dark:text-gray-400`}
                          >
                            {e.sexo}
                            {e.clave ?? "—"}
                          </td>

                          <td className="px-4 py-3">
                            {checkinAt ? (
                              <span className="inline-flex items-center gap-1.5 text-sm">
                                <HugeiconsIcon
                                  icon={CheckmarkCircle01Icon}
                                  size={18}
                                  className={
                                    isHombre
                                      ? "text-app-primary"
                                      : "text-pink-500 dark:text-pink-400"
                                  }
                                  aria-hidden
                                />
                                <span className="text-app-text-secondary dark:text-gray-400">
                                  {formatCheckinAt(checkinAt)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-app-text-secondary dark:text-gray-400">
                                —
                              </span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold ${isHombre ? "text-app-primary dark:text-app-primary-muted" : "text-pink-600 dark:text-pink-400"}`}
                          >
                            {e.sexo}
                            {e.checkins?.team?.teamNumber}
                            {e.checkins?.seat?.letter}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {(total > 0 || loading) && !error && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="text-sm text-app-text-secondary dark:text-gray-400">
                {from}-{to} de {total} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={page <= 1 || loading}
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
                  disabled={page >= totalPages || loading}
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
      </AnimatedMount>
    </section>
  );
}
