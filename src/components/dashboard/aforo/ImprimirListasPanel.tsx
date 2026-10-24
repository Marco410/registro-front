"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PrinterIcon } from "@hugeicons/core-free-icons";
import type { EquipoGestion, Seat } from "registro/graphql/aforo/queries";
import { armarListaEquipo, useExportListaEquipoPdf } from "./hooks";
import { getSeatSex } from "./seat-utils";

type SexoLista = "ambos" | "H" | "M";

const SEXOS: { value: SexoLista; label: string }[] = [
  { value: "ambos", label: "Ambos" },
  { value: "H", label: "Hombres" },
  { value: "M", label: "Mujeres" },
];

export interface ImprimirListasPanelProps {
  /** Equipos en el orden del salón (desde el altar). */
  teams: EquipoGestion[];
  /** Asientos de SEATS_QUERY: traen ocupantes y responsables de cada equipo. */
  seats: Seat[];
}

/**
 * Pestaña "Imprimir listas" de Gestionar equipos: se eligen equipos y sexo, y se descarga
 * un solo PDF con una hoja carta por lista (cada hoja con la lista dos veces, para doblar),
 * en el orden del salón y, por equipo, hombres antes que mujeres.
 */
export function ImprimirListasPanel({ teams, seats }: ImprimirListasPanelProps) {
  const [seleccion, setSeleccion] = useState<Set<string>>(() => new Set());
  const [sexo, setSexo] = useState<SexoLista>("ambos");
  const { exportListasEquiposPdf, loading } = useExportListaEquipoPdf();

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

  const sexos: ("H" | "M")[] = sexo === "ambos" ? ["H", "M"] : [sexo];
  const listas = teams
    .filter((t) => seleccion.has(t.id))
    .flatMap((t) =>
      sexos.map((sx) => armarListaEquipo(seatsPorEquipo.get(t.id) ?? [], sx)),
    )
    .filter((l) => l != null);

  const todos = teams.length > 0 && seleccion.size === teams.length;
  const alternar = (id: string) =>
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const descargar = () => {
    const fecha = new Date().toISOString().slice(0, 10);
    void exportListasEquiposPdf(listas, `Listas-equipos-${fecha}.pdf`);
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto border-y border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1f22]">
        <label className="sticky top-0 z-10 flex cursor-pointer items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-app-text-secondary dark:border-gray-800 dark:bg-[#26272a] dark:text-gray-400">
          <input
            type="checkbox"
            checked={todos}
            ref={(el) => {
              if (el) el.indeterminate = seleccion.size > 0 && !todos;
            }}
            onChange={() =>
              setSeleccion(todos ? new Set() : new Set(teams.map((t) => t.id)))
            }
            className="h-4 w-4 accent-app-primary"
          />
          {todos ? "Quitar todos" : "Seleccionar todos"}
          <span className="ml-auto tabular-nums">
            {seleccion.size} de {teams.length}
          </span>
        </label>
        {teams.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-app-text-secondary dark:text-gray-400">
            No hay equipos.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {teams.map((team) => {
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
          aria-label="Listas de"
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
          onClick={descargar}
          disabled={listas.length === 0 || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-app-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-app-primary-muted dark:text-gray-900"
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} />
          {loading
            ? "Generando…"
            : listas.length === 0
              ? "Descargar PDF"
              : `Descargar PDF · ${listas.length} ${listas.length === 1 ? "hoja" : "hojas"}`}
        </button>
      </div>
    </>
  );
}
