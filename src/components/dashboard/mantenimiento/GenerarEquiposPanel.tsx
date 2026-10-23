"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { MantenimientoAgeGroup } from "registro/graphql/mantenimiento/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { useGenerateTeams, useSeedAgeGroups } from "./hooks";

/** Asientos por sexo del seed (A–O). */
const SEATS_DEFAULT = 15;
const MAX_TEAMS_PER_GROUP = 50;
const MAX_SEATS_PER_GENDER = 26;

const numberInputClass =
  "w-20 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-right text-sm tabular-nums text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 disabled:opacity-60 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100";

/** Equipos que faltan para llegar al máximo del grupo: lo mismo que crea `db:seed`. */
function seedCount(ag: MantenimientoAgeGroup): number {
  return Math.max(0, ag.maxTeams - ag.teamsCount);
}

function clampInt(value: string, max: number): number {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 0), max);
}

export interface GenerarEquiposPanelProps {
  ageGroups: MantenimientoAgeGroup[];
  loading: boolean;
}

/**
 * Genera equipos y asientos en lote, como `db:seed`. Por defecto propone, por grupo de
 * edad, los equipos que faltan para llegar a su máximo y 15 asientos por sexo; todo se
 * puede ajustar antes de confirmar.
 */
export function GenerarEquiposPanel({ ageGroups, loading }: GenerarEquiposPanelProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [seatsH, setSeatsH] = useState(SEATS_DEFAULT);
  const [seatsM, setSeatsM] = useState(SEATS_DEFAULT);
  const [confirming, setConfirming] = useState(false);
  const { generateTeams, loading: generating } = useGenerateTeams();
  const { seedAgeGroups, loading: seeding } = useSeedAgeGroups();

  const defaults = useMemo(
    () => Object.fromEntries(ageGroups.map((ag) => [ag.id, seedCount(ag)])),
    [ageGroups],
  );
  useEffect(() => {
    setCounts(defaults);
  }, [defaults]);

  const countOf = (id: string) => counts[id] ?? 0;
  const totalTeams = ageGroups.reduce((sum, ag) => sum + countOf(ag.id), 0);
  const totalSeats = totalTeams * (seatsH + seatsM);
  const isSeedDefault =
    seatsH === SEATS_DEFAULT &&
    seatsM === SEATS_DEFAULT &&
    ageGroups.every((ag) => countOf(ag.id) === defaults[ag.id]);

  const resetToSeed = () => {
    setCounts(defaults);
    setSeatsH(SEATS_DEFAULT);
    setSeatsM(SEATS_DEFAULT);
  };

  const handleGenerate = async () => {
    const ok = await generateTeams({
      groups: ageGroups
        .map((ag) => ({ ageGroupId: ag.id, count: countOf(ag.id) }))
        .filter((g) => g.count > 0),
      seatsHombres: seatsH,
      seatsMujeres: seatsM,
    });
    if (ok) setConfirming(false);
  };

  return (
    <section
      aria-labelledby="generar-equipos-title"
      className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]"
    >
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h2
          id="generar-equipos-title"
          className="text-base font-semibold text-app-text-primary dark:text-white"
        >
          Generar equipos y asientos
        </h2>
        <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
          Como <code className="font-mono text-xs">db:seed</code>: por defecto
          completa cada grupo de edad hasta su máximo de equipos. La numeración
          sigue después del último equipo.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2 p-5" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : ageGroups.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            No hay grupos de edad. Créalos como el seed para poder generar
            equipos.
          </p>
          <button
            type="button"
            onClick={() => void seedAgeGroups()}
            disabled={seeding}
            className="mt-3 rounded-lg bg-app-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900"
          >
            {seeding ? "Creando…" : "Crear grupos de edad del seed"}
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.03]">
                <tr className="whitespace-nowrap text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  <th scope="col" className="py-2.5 pl-5 pr-3">
                    Grupo de edad
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Equipos actuales
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Máximo
                  </th>
                  <th scope="col" className="py-2.5 pl-3 pr-5 text-right">
                    Equipos a crear
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ageGroups.map((ag) => {
                  const inputId = `generar-${ag.id}`;
                  return (
                    <tr key={ag.id}>
                      <td className="py-2 pl-5 pr-3">
                        <label
                          htmlFor={inputId}
                          className="font-medium text-app-text-primary dark:text-gray-100"
                        >
                          {ag.label}
                        </label>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
                        {ag.teamsCount}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
                        {ag.maxTeams}
                      </td>
                      <td className="py-2 pl-3 pr-5 text-right">
                        <input
                          id={inputId}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={MAX_TEAMS_PER_GROUP}
                          value={countOf(ag.id)}
                          onChange={(e) =>
                            setCounts((prev) => ({
                              ...prev,
                              [ag.id]: clampInt(e.target.value, MAX_TEAMS_PER_GROUP),
                            }))
                          }
                          disabled={generating}
                          className={numberInputClass}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
            <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <legend className="sr-only">Asientos por equipo</legend>
              <span className="text-sm font-medium text-app-text-primary dark:text-gray-200">
                Asientos por equipo
              </span>
              <label className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
                Hombres
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_SEATS_PER_GENDER}
                  value={seatsH}
                  onChange={(e) =>
                    setSeatsH(clampInt(e.target.value, MAX_SEATS_PER_GENDER))
                  }
                  disabled={generating}
                  className={numberInputClass}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
                Mujeres
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_SEATS_PER_GENDER}
                  value={seatsM}
                  onChange={(e) =>
                    setSeatsM(clampInt(e.target.value, MAX_SEATS_PER_GENDER))
                  }
                  disabled={generating}
                  className={numberInputClass}
                />
              </label>
              <span className="text-xs text-app-text-secondary dark:text-gray-400">
                Letras de la A en adelante (15 = A–O)
              </span>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-app-text-secondary dark:text-gray-400">
                {totalTeams > 0 ? (
                  <>
                    Se crearán{" "}
                    <span className="font-semibold tabular-nums text-app-text-primary dark:text-white">
                      {totalTeams} equipos
                    </span>{" "}
                    y{" "}
                    <span className="font-semibold tabular-nums text-app-text-primary dark:text-white">
                      {totalSeats} asientos
                    </span>
                    .
                  </>
                ) : (
                  "Todos los grupos ya tienen su máximo de equipos."
                )}
                {!isSeedDefault ? (
                  <button
                    type="button"
                    onClick={resetToSeed}
                    className="ml-2 font-medium text-blue-700 underline-offset-2 hover:underline dark:text-app-primary-muted"
                  >
                    Volver a los valores del seed
                  </button>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={totalTeams === 0 || (seatsH + seatsM === 0) || generating}
                className="inline-flex items-center gap-2 rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
                Generar equipos
              </button>
            </div>
          </div>
        </>
      )}

      <GlassModal
        open={confirming}
        onClose={() => setConfirming(false)}
        ariaLabelledBy="confirmar-generar-title"
        panelClassName="max-w-md p-6"
        disableBackdropClose={generating}
      >
        <h2
          id="confirmar-generar-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Generar {totalTeams} equipos?
        </h2>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Con {seatsH} asientos de hombres y {seatsM} de mujeres cada uno (
          {totalSeats} en total).
        </p>
        <ul className="mt-4 max-h-60 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-3 text-sm dark:bg-white/[0.04]">
          {ageGroups
            .filter((ag) => countOf(ag.id) > 0)
            .map((ag) => (
              <li key={ag.id} className="flex justify-between gap-3">
                <span className="text-app-text-primary dark:text-gray-200">
                  {ag.label}
                </span>
                <span className="tabular-nums text-app-text-secondary dark:text-gray-400">
                  {countOf(ag.id)} {countOf(ag.id) === 1 ? "equipo" : "equipos"}
                </span>
              </li>
            ))}
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={generating}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900"
          >
            {generating ? "Generando…" : "Generar"}
          </button>
        </div>
      </GlassModal>
    </section>
  );
}
