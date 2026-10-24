"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ChurchIcon,
  Download01Icon,
  PencilEdit02Icon,
  PrinterIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { Seat, SeatEncontrado } from "registro/graphql/aforo/queries";
import type { TeamResponsableField } from "registro/graphql/aforo/mutations";
import { GlassModal } from "registro/components/shared/GlassModal";
import {
  useExportBautizosExcel,
  useExportSeatsExcel,
  usePrintCertificate,
  useUpdateTeamResponsables,
} from "./hooks";
import {
  ConfirmarBautizoModal,
  type BautizoAccion,
} from "./ConfirmarBautizoModal";
import { SEX_STYLES, getSeatSex, sortSeatsByLetter } from "./seat-utils";

type Sexo = "H" | "M";
type SeatEstado = "ocupado" | "libre" | "baja";
type Filtro = "todos" | SeatEstado;

/** Responsables del equipo; los campos de hombres llevan sufijo `_h`. */
const RESPONSABLES: {
  label: string;
  field: Record<Sexo, TeamResponsableField>;
}[] = [
  { label: "Capitán", field: { H: "captain_h", M: "captain" } },
  { label: "Auxiliar 1", field: { H: "auxiliar1_h", M: "auxiliar1" } },
  { label: "Auxiliar 2", field: { H: "auxiliar2_h", M: "auxiliar2" } },
  { label: "Auxiliar 3", field: { H: "auxiliar3_h", M: "auxiliar3" } },
  { label: "Auxiliar 4", field: { H: "auxiliar4_h", M: "auxiliar4" } },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 disabled:opacity-60 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

const secondaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-app-text-primary shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

function getSeatEstado(seat: Seat): SeatEstado {
  if (seat.occupied) return "ocupado";
  return seat.abandoned ? "baja" : "libre";
}

function nombreCompleto(
  persona: { nombre: string; apellido_p: string; apellido_m: string } | null,
): string {
  if (!persona) return "";
  return [persona.nombre, persona.apellido_p, persona.apellido_m]
    .map((parte) => (parte ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/** Nombre para los Excel; "—" si el asiento no tiene encontrado. */
function getEncontradoNombre(seat: Seat): string {
  return seat.encontrado ? nombreCompleto(seat.encontrado) : "—";
}

/** "Sí" como insignia (ámbar si requiere atención) o "No" atenuado. */
function SiNo({ value, attention = false }: { value: boolean; attention?: boolean }) {
  if (!value) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">No</span>;
  }
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        attention
          ? "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30"
          : "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15"
      }`}
    >
      Sí
    </span>
  );
}

/**
 * Capitán y auxiliares: en modo lectura caben en una línea; "Editar" abre los
 * cinco campos en el mismo lugar. Enter guarda y Escape cancela.
 */
function ResponsablesEditor({
  teamId,
  sex,
  saved,
}: {
  teamId: string | null;
  sex: Sexo;
  saved: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(saved);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { updateResponsables, loading } = useUpdateTeamResponsables();

  useEffect(() => {
    if (editing) firstInputRef.current?.focus();
  }, [editing]);

  const dirty = draft.some((value, i) => value.trim() !== saved[i]);
  const hasAny = saved.some(Boolean);

  const startEdit = () => {
    setDraft(saved);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !dirty) return;
    const data = Object.fromEntries(
      RESPONSABLES.map((r, i) => [r.field[sex], draft[i].trim()]),
    );
    if (await updateResponsables(teamId, data)) setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {hasAny ? (
          <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            {RESPONSABLES.map((r, i) => (
              <div key={r.label} className="flex items-baseline gap-1.5">
                <dt className="text-xs text-app-text-secondary dark:text-gray-400">
                  {r.label}
                </dt>
                <dd
                  className={`text-sm ${
                    saved[i]
                      ? "font-medium text-app-text-primary dark:text-gray-100"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {saved[i] || "—"}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            Este equipo aún no tiene capitán ni auxiliares.
          </p>
        )}
        <button
          type="button"
          onClick={startEdit}
          disabled={!teamId}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-app-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-app-primary-muted dark:hover:bg-app-primary-muted/15"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} className="shrink-0" />
          {hasAny ? "Editar responsables" : "Asignar responsables"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !loading) setEditing(false);
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {RESPONSABLES.map((r, i) => {
          const inputId = `responsable-${sex}-${i}`;
          return (
            <div key={r.label}>
              <label
                htmlFor={inputId}
                className="mb-1 block text-xs font-medium text-app-text-secondary dark:text-gray-400"
              >
                {r.label}
              </label>
              <input
                id={inputId}
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                value={draft[i]}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev.map((v, j) => (j === i ? e.target.value : v)),
                  )
                }
                placeholder="Nombre"
                autoComplete="off"
                disabled={loading}
                className={inputClass}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-app-text-secondary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !dirty}
          className="rounded-lg bg-app-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900 dark:hover:bg-app-primary-muted/90"
        >
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export interface TeamSeatsModalProps {
  open: boolean;
  onClose: () => void;
  teamLabel: string;
  seats: Seat[];
  sex: Sexo;
}

/**
 * Lista de asientos de un equipo para un sexo: responsables, filtros por
 * estado, exportaciones y acciones de bautizo por encontrado.
 */
export function TeamSeatsModal({
  open,
  onClose,
  teamLabel,
  seats,
  sex,
}: TeamSeatsModalProps) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [showConfirmBautizo, setShowConfirmBautizo] = useState(false);
  const [accionBautizo, setAccionBautizo] = useState<BautizoAccion>("aplicar");
  const [bautizoEncontrado, setBautizoEncontrado] =
    useState<SeatEncontrado | null>(null);
  const [printingCertificateId, setPrintingCertificateId] = useState<
    string | null
  >(null);

  const { exportSeatsToExcel } = useExportSeatsExcel();
  const { exportBautizosToExcel } = useExportBautizosExcel();
  const { PrintCertificate } = usePrintCertificate();

  const sexSeats = useMemo(
    () => sortSeatsByLetter(seats.filter((seat) => getSeatSex(seat) === sex)),
    [seats, sex],
  );
  const teamInfo = sexSeats[0]?.team ?? seats[0]?.team ?? null;
  const style = SEX_STYLES[sex];

  const saved = useMemo(
    () => RESPONSABLES.map((r) => (teamInfo?.[r.field[sex]] ?? "").trim()),
    [teamInfo, sex],
  );

  const counts = useMemo(() => {
    const result = { ocupado: 0, libre: 0, baja: 0, bautizados: 0 };
    for (const seat of sexSeats) {
      result[getSeatEstado(seat)] += 1;
      if (seat.occupied && seat.encontrado?.bautizo) result.bautizados += 1;
    }
    return result;
  }, [sexSeats]);

  const visibleSeats =
    filtro === "todos"
      ? sexSeats
      : sexSeats.filter((seat) => getSeatEstado(seat) === filtro);

  const filtros: { value: Filtro; label: string; count: number }[] = [
    { value: "todos", label: "Todos", count: sexSeats.length },
    { value: "ocupado", label: "Ocupados", count: counts.ocupado },
    { value: "libre", label: "Libres", count: counts.libre },
    ...(counts.baja > 0
      ? [{ value: "baja" as const, label: "Bajas", count: counts.baja }]
      : []),
  ];

  const exportParams = {
    filteredSeats: sexSeats,
    teamLabel,
    sex,
    getEncontradoNombre,
    teamNumber: teamInfo?.teamNumber ?? undefined,
  };

  const openBautizoModal = (encontrado: SeatEncontrado) => {
    setBautizoEncontrado(encontrado);
    setAccionBautizo(encontrado.bautizo ? "quitar" : "aplicar");
    setShowConfirmBautizo(true);
  };

  const closeBautizoModal = () => {
    setShowConfirmBautizo(false);
    setBautizoEncontrado(null);
  };

  const handlePrintCertificate = async (encontrado: SeatEncontrado) => {
    setPrintingCertificateId(encontrado.id);
    try {
      await PrintCertificate(
        encontrado.nombre,
        encontrado.apellido_p,
        encontrado.apellido_m,
      );
    } finally {
      setPrintingCertificateId(null);
    }
  };

  const emptyMessage =
    sexSeats.length === 0
      ? `Este equipo no tiene asientos para ${style.label.toLowerCase()}.`
      : filtro === "ocupado"
        ? "No hay asientos ocupados."
        : filtro === "libre"
          ? "No hay asientos libres."
          : "No hay asientos dados de baja.";

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="team-seats-modal-title"
      panelClassName="flex max-w-5xl flex-col overflow-hidden"
      zIndex={50}
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <h2
            id="team-seats-modal-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            {teamInfo?.teamName ?? teamLabel}
            <span className="font-normal text-gray-400"> · </span>
            <span className={style.text}>{style.label}</span>
          </h2>
          <p className="mt-0.5 text-sm tabular-nums text-app-text-secondary dark:text-gray-400">
            {teamInfo?.ageGroup?.label ? `${teamInfo.ageGroup.label} · ` : ""}
            <span className="font-semibold text-app-text-primary dark:text-gray-100">
              {counts.ocupado}
            </span>{" "}
            de {sexSeats.length} ocupados · {counts.libre} libres
            {counts.bautizados > 0 ? ` · ${counts.bautizados} bautizados` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      <section
        aria-label="Responsables del equipo"
        className="mx-5 rounded-xl bg-white/80 px-4 py-3 ring-1 ring-gray-200/80 dark:bg-white/[0.04] dark:ring-white/10"
      >
        <ResponsablesEditor
          teamId={teamInfo?.id ?? null}
          sex={sex}
          saved={saved}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
        <div
          role="radiogroup"
          aria-label="Filtrar asientos"
          className="flex flex-wrap gap-1"
        >
          {filtros.map((f) => {
            const active = f.value === filtro;
            return (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFiltro(f.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                  active
                    ? "bg-app-selected text-blue-700 dark:bg-app-primary-muted/20 dark:text-app-primary-muted"
                    : "text-app-text-secondary hover:bg-gray-100 hover:text-app-text-primary dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {f.label}
                <span className="tabular-nums opacity-75">{f.count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              exportSeatsToExcel({
                ...exportParams,
                captain: saved[0],
                aux1: saved[1],
                aux2: saved[2],
                aux3: saved[3],
                aux4: saved[4],
              })
            }
            disabled={sexSeats.length === 0}
            className={secondaryButtonClass}
          >
            <HugeiconsIcon icon={Download01Icon} size={14} className="shrink-0" />
            Lista del equipo
          </button>
          <button
            type="button"
            onClick={() => exportBautizosToExcel(exportParams)}
            disabled={counts.bautizados === 0}
            title={
              counts.bautizados === 0 ? "Nadie de este equipo está bautizado" : undefined
            }
            className={secondaryButtonClass}
          >
            <HugeiconsIcon icon={Download01Icon} size={14} className="shrink-0" />
            Bautizados
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1f22]">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#26272a]">
            <tr className="whitespace-nowrap text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
              <th scope="col" className="w-20 py-2.5 pl-5 pr-3">
                Clave
              </th>
              <th scope="col" className="min-w-[13rem] px-3 py-2.5">
                Encontrado
              </th>
              <th scope="col" className="w-24 px-3 py-2.5 text-center">
                Celular
              </th>
              <th scope="col" className="w-28 px-3 py-2.5 text-center">
                Medicamento
              </th>
              <th scope="col" className="w-44 px-3 py-2.5">
                Bautizo
              </th>
              <th scope="col" className="w-32 py-2.5 pl-3 pr-5">
                Clave antigua
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {visibleSeats.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-app-text-secondary dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleSeats.map((seat) => {
                const estado = getSeatEstado(seat);
                const encontrado = estado === "ocupado" ? seat.encontrado : null;
                const clave = `${sex}${teamInfo?.teamNumber ?? ""}${seat.letter}`;
                const isPrinting = printingCertificateId === encontrado?.id;

                return (
                  <tr
                    key={seat.id}
                    className={
                      encontrado
                        ? "transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        : undefined
                    }
                  >
                    <td
                      className={`py-2.5 pl-5 pr-3 font-semibold tabular-nums ${
                        encontrado
                          ? "text-app-text-primary dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {clave}
                    </td>
                    <td className="px-3 py-2.5">
                      {encontrado ? (
                        <>
                          <p className="font-medium text-app-text-primary dark:text-white">
                            {nombreCompleto(encontrado)}
                          </p>
                          <p className="whitespace-nowrap text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                            {[
                              encontrado.edad != null ? `${encontrado.edad} años` : "",
                              encontrado.telefono ?? "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </>
                      ) : estado === "baja" ? (
                        <span className="inline-flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400">
                          <span className="rounded bg-gray-500 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-white dark:bg-gray-600">
                            Baja
                          </span>
                          {nombreCompleto(seat.abandonedBy)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          {estado === "ocupado" ? "Ocupado (sin datos)" : "Libre"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {encontrado ? <SiNo value={encontrado.celular} /> : null}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {encontrado ? (
                        <SiNo value={encontrado.medicamento} attention />
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      {encontrado ? (
                        encontrado.bautizo ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openBautizoModal(encontrado)}
                              title="Quitar bautizo"
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30 dark:hover:bg-emerald-500/25"
                            >
                              <HugeiconsIcon icon={Tick02Icon} size={12} className="shrink-0" />
                              Bautizado
                            </button>
                            <button
                              type="button"
                              onClick={() => void handlePrintCertificate(encontrado)}
                              disabled={isPrinting}
                              aria-label={`Imprimir certificado de ${nombreCompleto(encontrado)}`}
                              title="Imprimir certificado"
                              className="rounded-md p-1.5 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:cursor-wait disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <HugeiconsIcon icon={PrinterIcon} size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openBautizoModal(encontrado)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-app-text-secondary ring-1 ring-inset ring-gray-300 transition-colors hover:bg-gray-50 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-white/5 dark:hover:text-white"
                          >
                            <HugeiconsIcon icon={ChurchIcon} size={12} className="shrink-0" />
                            Aplicar
                          </button>
                        )
                      ) : null}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                      {encontrado?.checkins?.claveOld ?? ""}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showConfirmBautizo && (
        <ConfirmarBautizoModal
          open={showConfirmBautizo}
          accion={accionBautizo}
          encontrado={bautizoEncontrado}
          onSuccess={closeBautizoModal}
          onCancel={closeBautizoModal}
          zIndex={70}
        />
      )}
    </GlassModal>
  );
}
