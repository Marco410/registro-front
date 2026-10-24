"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import {
  EQUIPOS_GESTION_QUERY,
  type EquipoGestion,
  type EquiposGestionResponse,
  type Seat,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { getSeatSex } from "./seat-utils";

type SexoSeleccion = "ambos" | "H" | "M";

const SEXOS: { value: SexoSeleccion; label: string }[] = [
  { value: "ambos", label: "Ambos" },
  { value: "H", label: "Hombres" },
  { value: "M", label: "Mujeres" },
];

export interface SeleccionEquiposPanelProps<T> {
  /** Equipos en el orden del salón (desde el altar). */
  teams: EquipoGestion[];
  /** Asientos de SEATS_QUERY: traen ocupantes y responsables de cada equipo. */
  seats: Seat[];
  /** Lo que se genera de un equipo y sexo; null si no aplica (p. ej. sin asientos de ese sexo). */
  armar: (seatsDelEquipo: Seat[], sex: "H" | "M") => T | null;
  /** Genera y descarga, con los elementos en el orden del salón (hombres antes que mujeres). */
  descargar: (items: T[]) => void | Promise<void>;
  loading: boolean;
  /** Cómo se cuenta lo que sale: ["hoja", "hojas"], ["etiqueta", "etiquetas"]. */
  unidad: [string, string];
  /** Solo lista equipos con al menos un asiento ocupado. */
  soloConOcupados?: boolean;
}

/**
 * Selección de equipos y sexo para generar un PDF (listas, etiquetas…): casillas por equipo
 * con "Seleccionar todos", Ambos / Hombres / Mujeres y un botón que dice cuánto va a salir.
 */
export function SeleccionEquiposPanel<T>({
  teams,
  seats,
  armar,
  descargar,
  loading,
  unidad,
  soloConOcupados = false,
}: SeleccionEquiposPanelProps<T>) {
  const [seleccion, setSeleccion] = useState<Set<string>>(() => new Set());
  const [sexo, setSexo] = useState<SexoSeleccion>("ambos");

  const seatsPorEquipo = useMemo(() => {
    const mapa = new Map<string, Seat[]>();
    for (const seat of seats) {
      const id = seat.team?.id;
      if (!id) continue;
      const lista = mapa.get(id) ?? [];
      lista.push(seat);
      mapa.set(id, lista);
    }
    return mapa;
  }, [seats]);

  const visibles = useMemo(
    () =>
      soloConOcupados
        ? teams.filter((t) => (seatsPorEquipo.get(t.id) ?? []).some((s) => s.occupied))
        : teams,
    [teams, seatsPorEquipo, soloConOcupados],
  );

  const sexos: ("H" | "M")[] = sexo === "ambos" ? ["H", "M"] : [sexo];
  const items = visibles
    .filter((t) => seleccion.has(t.id))
    .flatMap((t) => sexos.map((sx) => armar(seatsPorEquipo.get(t.id) ?? [], sx)))
    .filter((item): item is T => item != null);

  const todos = visibles.length > 0 && visibles.every((t) => seleccion.has(t.id));
  const algunos = visibles.some((t) => seleccion.has(t.id));
  const alternar = (id: string) =>
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto border-y border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1f22]">
        <label className="sticky top-0 z-10 flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-app-text-secondary dark:border-gray-800 dark:bg-[#26272a] dark:text-gray-400">
          <input
            type="checkbox"
            checked={todos}
            ref={(el) => {
              if (el) el.indeterminate = algunos && !todos;
            }}
            onChange={() =>
              setSeleccion(todos ? new Set() : new Set(visibles.map((t) => t.id)))
            }
            className="h-4 w-4 accent-app-primary"
          />
          {todos ? "Quitar todos" : "Seleccionar todos"}
          <span className="ml-auto tabular-nums">
            {visibles.filter((t) => seleccion.has(t.id)).length} de {visibles.length}
          </span>
        </label>
        {visibles.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-app-text-secondary dark:text-gray-400">
            {soloConOcupados ? "Ningún equipo tiene asientos ocupados." : "No hay equipos."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {visibles.map((team) => {
              const del = seatsPorEquipo.get(team.id) ?? [];
              const ocupados = (sx: "H" | "M") =>
                del.filter((s) => getSeatSex(s) === sx && s.occupied).length;
              return (
                <li key={team.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                    <input
                      type="checkbox"
                      checked={seleccion.has(team.id)}
                      onChange={() => alternar(team.id)}
                      className="h-4 w-4 shrink-0 accent-app-primary"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-app-text-primary dark:text-gray-100">
                      {team.teamName}
                      {team.ageGroup?.label ? (
                        <span className="font-normal text-app-text-secondary dark:text-gray-400">
                          {" "}
                          · {team.ageGroup.label}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                      H {ocupados("H")}/{team.hombres} · M {ocupados("M")}/{team.mujeres}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div
          role="radiogroup"
          aria-label="Sexo"
          className="inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600"
        >
          {SEXOS.map((op) => (
            <button
              key={op.value}
              type="button"
              role="radio"
              aria-checked={sexo === op.value}
              onClick={() => setSexo(op.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                sexo === op.value
                  ? "bg-app-selected text-blue-700 dark:bg-app-primary-muted/20 dark:text-app-primary-muted"
                  : "text-app-text-secondary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void descargar(items)}
          disabled={items.length === 0 || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-app-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-app-primary-muted dark:text-gray-900"
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} />
          {loading
            ? "Generando…"
            : items.length === 0
              ? "Descargar PDF"
              : `Descargar PDF · ${items.length} ${items.length === 1 ? unidad[0] : unidad[1]}`}
        </button>
      </div>
    </>
  );
}

export interface SeleccionEquiposModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** El panel, con los equipos ya cargados (en el orden del salón). */
  children: (teams: EquipoGestion[]) => ReactNode;
}

/** Modal que carga los equipos y muestra un panel de selección (listas, etiquetas…). */
export function SeleccionEquiposModal({
  open,
  onClose,
  title,
  description,
  children,
}: SeleccionEquiposModalProps) {
  const { data, loading } = useQuery<EquiposGestionResponse>(EQUIPOS_GESTION_QUERY, {
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="seleccion-equipos-title"
      panelClassName="flex max-h-[min(90vh,calc(100dvh-2rem))] max-w-2xl min-h-0 flex-col overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div>
          <h2
            id="seleccion-equipos-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
            {description}
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

      {loading && !data ? (
        <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        children(data?.teams ?? [])
      )}
    </GlassModal>
  );
}
