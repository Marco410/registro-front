"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import {
  ENCONTRADOS_QUERY,
  buildEncontradoSearchWhere,
  type EncontradoListItem,
  type EncontradosQueryResponse,
  type EncontradosQueryVariables,
} from "registro/graphql/encontrados/queries";
import { useAuth } from "registro/hooks/use-auth";
import type { Seat } from "registro/graphql/aforo/queries";
import { useReassignSeat } from "registro/components/dashboard/aforo/hooks";
import { GlassModal } from "registro/components/shared/GlassModal";

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
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export interface AsignarAsientoModalProps {
  open: boolean;
  /** Datos del asiento destino (nuevo asiento). */
  seat: Pick<Seat, "id" | "letter" | "team">;
  /** Sexo del asiento (H/M) para filtrar encontrados. */
  sex: "H" | "M";
  /** Llamado tras asignar correctamente (ej. cerrar modal). */
  onSuccess?: () => void;
  onCancel: () => void;
}

/**
 * Modal para asignar un encontrado a un asiento: lista encontrados con check-in,
 * al seleccionar uno se obtiene su asiento actual (checkins.seat) y al confirmar
 * se ejecuta performReassignSeat(encontradoId, currentSeatId, newSeatId).
 */
export function AsignarAsientoModal({
  open,
  seat,
  sex,
  onSuccess,
  onCancel,
}: AsignarAsientoModalProps) {
  const { user } = useAuth();
  const userId = user?.id != null ? String(user.id) : "";
  const { performReassign, loading: submitting } = useReassignSeat();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [sexoFilter, setSexoFilter] = useState<"H" | "M">(sex);
  const [selectedEncontrado, setSelectedEncontrado] =
    useState<EncontradoListItem | null>(null);
  const [showConfirmAsignar, setShowConfirmAsignar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search.trim().toLowerCase());
      setPage(1);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const seatLabel = seat.team
    ? `Eq. ${seat.team.teamNumber}${seat.team.ageGroup?.label ? ` (${seat.team.ageGroup.label})` : ""} - ${seat.letter}`
    : `Asiento ${seat.letter}`;

  return (
    <>
      <GlassModal
        open={open}
        onClose={onCancel}
        ariaLabelledBy="asignar-asiento-modal-title"
        panelClassName="flex max-h-[min(90vh,calc(100dvh-2rem))] max-w-2xl min-h-0 flex-col overflow-hidden"
        disableBackdropClose={submitting}
        zIndex={50}
      >
        <div className="shrink-0 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <h2
            id="asignar-asiento-modal-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Asignar a otro
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
            Asiento seleccionado
          </p>
          <div
            className={`mt-1.5 inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 ${sex === "M" ? "border-pink-500 bg-pink-500/10 dark:border-pink-400 dark:bg-pink-500/15" : "border-app-primary bg-app-primary/10 dark:border-app-primary-muted dark:bg-app-primary-muted/15"}`}
            aria-label={`Asiento ${seatLabel}`}
          >
            <span
              className={`text-base font-bold tracking-tight ${sex === "M" ? "text-pink-600 dark:text-pink-400" : "text-app-primary dark:text-app-primary-muted"}`}
            >
              {seat.team?.teamName}
            </span>
            |
            <span
              className={`text-base font-bold tracking-tight ${sex === "M" ? "text-pink-600 dark:text-pink-400" : "text-app-primary dark:text-app-primary-muted"}`}
            >
              {sex}
              {seat.team?.teamNumber}
              {seat.letter}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          {/* <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
              Filtrar por sexo
            </span>
            <SexoSelector
              value={sexoFilter}
              onChange={(e) => {
                setPage(1);
                setSexoFilter(e.target.value as "H" | "M");
              }}
              label=""
              className="!mb-0"
            />
          </div> */}

          <EncontradosListInModal
            userId={userId}
            search={search}
            setSearch={setSearch}
            searchDebounced={searchDebounced}
            page={page}
            setPage={setPage}
            sexoFilter={sexoFilter}
            selectedId={selectedEncontrado?.id ?? null}
            onSelect={(e) => setSelectedEncontrado(e)}
            getCheckinAt={getCheckinAt}
            formatCheckinAt={formatCheckinAt}
            fullName={fullName}
            open={open}
          />
        </div>

        <div className="shrink-0 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedEncontrado) setShowConfirmAsignar(true);
            }}
            disabled={submitting || !selectedEncontrado}
            className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
          >
            Asignar a este asiento
          </button>
        </div>
      </GlassModal>

      {showConfirmAsignar && selectedEncontrado && (
        <ConfirmAsignarModal
          open={showConfirmAsignar}
          encontradoNombre={fullName(selectedEncontrado)}
          seatLabel={seatLabel}
          loading={submitting}
          onConfirm={async () => {
            if (!selectedEncontrado || !seat.id) return;
            const currentSeatId =
              selectedEncontrado.checkins?.seat?.id ?? seat.id;
            await performReassign({
              encontradoId: selectedEncontrado.id,
              currentSeatId,
              newSeatId: seat.id,
            });
            setShowConfirmAsignar(false);
            onSuccess?.();
          }}
          onCancel={() => setShowConfirmAsignar(false)}
        />
      )}
    </>
  );
}

interface ConfirmAsignarModalProps {
  open: boolean;
  encontradoNombre: string;
  seatLabel: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

function ConfirmAsignarModal({
  open,
  encontradoNombre,
  seatLabel,
  loading,
  onConfirm,
  onCancel,
}: ConfirmAsignarModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="confirm-asignar-modal-title"
      panelClassName="max-w-sm p-6"
      disableBackdropClose={loading}
      zIndex={70}
    >
        <h2
          id="confirm-asignar-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Asignar a este asiento?
        </h2>
        <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
          Se asignará a <strong>{encontradoNombre}</strong> al asiento{" "}
          <strong>{seatLabel}</strong>.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={loading}
            className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
          >
            {loading ? "Guardando…" : "Confirmar"}
          </button>
        </div>
    </GlassModal>
  );
}

interface EncontradosListInModalProps {
  userId: string;
  search: string;
  setSearch: (v: string) => void;
  searchDebounced: string;
  page: number;
  setPage: (v: number | ((p: number) => number)) => void;
  sexoFilter: "H" | "M";
  selectedId: string | null;
  onSelect: (e: EncontradoListItem) => void;
  getCheckinAt: (e: EncontradoListItem) => string | null;
  formatCheckinAt: (iso: string) => string;
  fullName: (e: EncontradoListItem) => string;
  open: boolean;
}

function EncontradosListInModal({
  userId,
  search,
  setSearch,
  searchDebounced,
  page,
  setPage,
  sexoFilter,
  selectedId,
  onSelect,
  getCheckinAt,
  formatCheckinAt,
  fullName,
  open,
}: EncontradosListInModalProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const searchNorm = searchDebounced;

  const where: EncontradosQueryVariables["where"] = {
    sexo: { equals: sexoFilter },
    checkins: { id: { not: null } },
  };
  const searchWhere = buildEncontradoSearchWhere(searchNorm);
  if (searchWhere) Object.assign(where, searchWhere);

  const { data, loading, error } = useQuery<
    EncontradosQueryResponse,
    EncontradosQueryVariables
  >(ENCONTRADOS_QUERY, {
    variables: { where, take, skip },
    skip: !open || !userId,
  });

  const list = data?.encontrados ?? [];
  const total = data?.encontradosCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-2">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre"
          className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 focus:ring-app-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Buscar por nombre"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar registros
        </p>
      ) : list.length === 0 && !loading ? (
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          {searchDebounced ? "Ningún registro coincide" : "No hay registros"}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-app-text-secondary dark:text-gray-400">
              Cargando…
            </div>
          )}
          {!loading && list.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                <tr>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Nombre
                  </th>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Edad
                  </th>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Clave
                  </th>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Check-in
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => {
                  const isSelected = selectedId === e.id;
                  const isHombre = e.sexo === "H";
                  const checkinAt = getCheckinAt(e);
                  const rowClass = isSelected
                    ? isHombre
                      ? "bg-app-primary/15 ring-inset ring-2 ring-app-primary"
                      : "bg-pink-500/15 ring-inset ring-2 ring-pink-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50";
                  return (
                    <tr
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(e)}
                      onKeyDown={(ev) =>
                        (ev.key === "Enter" || ev.key === " ") && onSelect(e)
                      }
                      className={`cursor-pointer border-b border-gray-100 last:border-b-0 dark:border-gray-700/80 ${rowClass}`}
                    >
                      <td className="px-3 py-2 font-medium">{fullName(e)}</td>
                      <td className="px-3 py-2">
                        {e.edad != null ? `${e.edad} años` : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 font-semibold ${isHombre ? "text-app-primary" : "text-pink-600 dark:text-pink-400"}`}
                      >
                        {e.sexo}
                        {e.checkins?.team?.teamNumber}
                        {e.checkins?.seat?.letter}
                      </td>
                      <td className="px-3 py-2">
                        {checkinAt ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={16}
                              className={
                                isHombre ? "text-app-primary" : "text-pink-500"
                              }
                              aria-hidden
                            />
                            {formatCheckinAt(checkinAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {total > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
          <p className="text-xs text-app-text-secondary dark:text-gray-400">
            {skip + 1}-{Math.min(skip + take, total)} de {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Página anterior"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
              Anterior
            </button>
            <span className="px-2 text-xs text-app-text-secondary dark:text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Página siguiente"
            >
              Siguiente
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
