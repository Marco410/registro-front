"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  SEAT_DETALLE_QUERY,
  type SeatDetallePersona,
  type SeatDetalleResponse,
  type SeatDetalleVariables,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";

function nombreDe(p: SeatDetallePersona): string {
  return (
    [p.nombre, p.apellido_p, p.apellido_m]
      .map((x) => (x ?? "").trim())
      .filter(Boolean)
      .join(" ") || "Sin nombre"
  );
}

function formatFechaHora(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Tarjeta de una persona del asiento: quién lo ocupa o quién lo dejó. */
function PersonaCard({
  titulo,
  persona,
  detalle,
  tono,
}: {
  titulo: string;
  persona: SeatDetallePersona;
  detalle: string | null;
  tono: "ocupado" | "baja";
}) {
  const datos = [
    persona.edad != null && persona.edad !== "" ? `${persona.edad} años` : null,
    persona.telefono?.trim() || null,
  ].filter(Boolean);
  return (
    <section
      className={`rounded-xl border p-4 ${
        tono === "ocupado"
          ? "border-gray-200 bg-white/70 dark:border-white/10 dark:bg-black/20"
          : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-white/[0.04]"
      }`}
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold text-app-text-primary dark:text-gray-200">
        {tono === "baja" ? (
          <span className="h-2 w-2 rounded-full bg-gray-500" aria-hidden />
        ) : null}
        {titulo}
      </h3>
      <p className="mt-1.5 text-sm font-semibold text-app-text-primary dark:text-white">
        {nombreDe(persona)}
      </p>
      {datos.length > 0 ? (
        <p className="mt-0.5 text-sm tabular-nums text-app-text-secondary dark:text-gray-400">
          {datos.join(" · ")}
        </p>
      ) : null}
      {detalle ? (
        <p className="mt-1 text-xs text-app-text-secondary dark:text-gray-400">{detalle}</p>
      ) : null}
    </section>
  );
}

export interface DetalleAsientoModalProps {
  open: boolean;
  seatId: string;
  onClose: () => void;
}

/**
 * Detalle de un asiento que alguien dejó (baja): quién lo dejó y, si ya lo ocupa alguien
 * más, quién y desde cuándo. El asiento solo guarda la última baja (`abandonedBy`).
 * Lee los datos al abrir para mostrarlos al día.
 */
export function DetalleAsientoModal({ open, seatId, onClose }: DetalleAsientoModalProps) {
  const { data, loading, error } = useQuery<SeatDetalleResponse, SeatDetalleVariables>(
    SEAT_DETALLE_QUERY,
    { variables: { id: seatId }, skip: !open, fetchPolicy: "network-only" },
  );
  const seat = data?.seat ?? null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const sexo = seat?.gender === "M" ? "M" : "H";
  const clave = seat ? `${sexo}${seat.team?.teamNumber ?? ""}${seat.letter}` : "";
  const ubicacion = seat
    ? [
        seat.team
          ? `${seat.team.teamName}${seat.team.ageGroup?.label ? ` (${seat.team.ageGroup.label})` : ""}`
          : "Sin equipo",
        sexo === "H" ? "Hombres" : "Mujeres",
        `asiento ${seat.letter}`,
      ].join(" · ")
    : "";
  const ocupante = seat?.occupied ? seat.encontrado : null;

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="detalle-asiento-title"
      panelClassName="max-w-lg max-h-[min(94vh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="detalle-asiento-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Detalle del asiento
          </h2>
          {seat ? (
            <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
              {ubicacion}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {seat ? (
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-app-text-primary dark:bg-white/10 dark:text-gray-100">
              {clave}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="mt-4 space-y-3" aria-hidden>
          <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : error || !seat ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-app-text-secondary dark:border-gray-600 dark:text-gray-400">
          {error ? "No se pudieron cargar los datos del asiento." : "No se encontró el asiento."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            {ocupante
              ? "Alguien dejó este asiento y ahora lo ocupa otra persona."
              : seat.abandonedBy
                ? "Alguien dejó este asiento y sigue libre."
                : seat.occupied
                  ? "Asiento ocupado; nadie lo ha dejado."
                  : "Asiento libre; nadie lo ha dejado."}
          </p>
          {ocupante ? (
            <PersonaCard
              titulo="Lo ocupa ahora"
              persona={ocupante}
              detalle={
                formatFechaHora(seat.assignedAt)
                  ? `Asignado el ${formatFechaHora(seat.assignedAt)}`
                  : null
              }
              tono="ocupado"
            />
          ) : null}
          {seat.abandonedBy ? (
            <PersonaCard
              titulo="Lo dejó (baja)"
              persona={seat.abandonedBy}
              detalle={
                formatFechaHora(seat.abandonedBy.checkins?.checkinAt)
                  ? `Había hecho check-in el ${formatFechaHora(seat.abandonedBy.checkins?.checkinAt)}`
                  : null
              }
              tono="baja"
            />
          ) : null}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>
    </GlassModal>
  );
}
