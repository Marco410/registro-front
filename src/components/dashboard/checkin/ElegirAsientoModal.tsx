"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  ASIENTOS_LIBRES_QUERY,
  type AsientosLibresResponse,
  type AsientosLibresVariables,
} from "registro/graphql/checkin/queries";
import { GlassModal } from "registro/components/shared/GlassModal";

export interface ElegirAsientoModalProps {
  open: boolean;
  /** Persona a la que se le hace el check-in. */
  encontrado: { nombre: string; sexo: "H" | "M" } | null;
  /** Hace el check-in en el asiento elegido; devuelve true si se hizo. */
  onConfirm: (seatId: string) => Promise<boolean>;
  confirming: boolean;
  onClose: () => void;
}

/**
 * Modal para cuando el check-in no encontró lugar automático (error `SIN_LUGAR`): lista los
 * equipos con asientos libres del sexo de la persona, el usuario elige uno y hace el check-in
 * en ese asiento. Si el asiento se ocupó mientras tanto, recarga la lista y quita la selección.
 */
export function ElegirAsientoModal({
  open,
  encontrado,
  onConfirm,
  confirming,
  onClose,
}: ElegirAsientoModalProps) {
  const sexo = encontrado?.sexo ?? "H";
  const isHombre = sexo === "H";
  const sexoPlural = isHombre ? "hombres" : "mujeres";

  const { data, loading, refetch } = useQuery<
    AsientosLibresResponse,
    AsientosLibresVariables
  >(ASIENTOS_LIBRES_QUERY, {
    variables: { sexo },
    skip: !open || !encontrado,
    fetchPolicy: "network-only",
  });
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSelectedSeatId(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, confirming, onClose]);

  const selected = useMemo(() => {
    for (const team of teams) {
      const seat = team.seats.find((s) => s.id === selectedSeatId);
      if (seat) return { team, seat };
    }
    return null;
  }, [teams, selectedSeatId]);

  const handleConfirm = async () => {
    if (!selected) return;
    const ok = await onConfirm(selected.seat.id);
    if (!ok) {
      setSelectedSeatId(null);
      void refetch();
    }
  };

  const seatClass = (isSelected: boolean) =>
    isSelected
      ? isHombre
        ? "border-app-primary/45 bg-app-primary text-white ring-2 ring-app-primary/40 dark:border-app-primary-muted/50 dark:bg-app-primary-muted dark:text-gray-900"
        : "border-pink-400/45 bg-pink-500 text-white ring-2 ring-pink-400/40 dark:border-pink-400/50"
      : isHombre
        ? "border-gray-300 bg-gray-50 text-app-text-secondary hover:border-app-primary/40 hover:bg-app-primary/10 hover:text-app-primary dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-app-primary-muted/45 dark:hover:bg-app-primary/15 dark:hover:text-app-primary-muted"
        : "border-gray-300 bg-gray-50 text-app-text-secondary hover:border-pink-400/40 hover:bg-pink-500/10 hover:text-pink-600 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-pink-400/45 dark:hover:bg-pink-500/15 dark:hover:text-pink-400";

  const confirmClass = isHombre
    ? "bg-app-primary hover:bg-app-primary/90 dark:bg-app-primary-muted dark:text-gray-900"
    : "bg-pink-600 hover:bg-pink-700";

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="elegir-asiento-title"
      panelClassName="flex max-h-[min(90vh,calc(100dvh-2rem))] max-w-2xl min-h-0 flex-col overflow-hidden"
      disableBackdropClose={confirming}
    >
      <div className="flex items-start gap-3 px-5 pb-3 pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <HugeiconsIcon icon={AlertCircleIcon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="elegir-asiento-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Ya no hay equipos con lugar
          </h2>
          <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
            No quedó lugar automático para{" "}
            <span className="font-medium text-app-text-primary dark:text-gray-200">
              {encontrado?.nombre}
            </span>
            . Elige un asiento libre de {sexoPlural} y haz el check-in.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={confirming}
          aria-label="Cerrar"
          className="-mr-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-y border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1f22]">
        {loading && !data ? (
          <div className="space-y-2 p-4" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-app-text-secondary dark:text-gray-400">
            No hay asientos libres para {sexoPlural} en ningún equipo. Agrega
            asientos en Aforo &gt; Gestionar asientos.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {teams.map((team) => (
              <li key={team.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium text-app-text-primary dark:text-gray-100">
                    {team.teamName}
                    {team.ageGroup?.label ? (
                      <span className="font-normal text-app-text-secondary dark:text-gray-400">
                        {" "}
                        · {team.ageGroup.label}
                      </span>
                    ) : null}
                  </p>
                  <span className="shrink-0 text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                    {team.seats.length}{" "}
                    {team.seats.length === 1 ? "libre" : "libres"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {team.seats.map((seat) => {
                    const isSelected = seat.id === selectedSeatId;
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => setSelectedSeatId(seat.id)}
                        disabled={confirming}
                        aria-pressed={isSelected}
                        aria-label={`${team.teamName}, asiento ${seat.letter}`}
                        className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:opacity-60 ${seatClass(isSelected)}`}
                      >
                        {seat.letter}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p className="text-xs text-app-text-secondary dark:text-gray-400">
          {selected
            ? `${selected.team.teamName} · asiento ${selected.seat.letter}`
            : "Elige un asiento."}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-app-text-secondary transition-colors hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!selected || confirming}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${confirmClass}`}
          >
            {confirming
              ? "Haciendo check-in…"
              : selected
                ? `Hacer check-in en ${selected.team.teamName} · asiento ${selected.seat.letter}`
                : "Hacer check-in"}
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
