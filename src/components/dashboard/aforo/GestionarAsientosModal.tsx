"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import {
  TEAMS_QUERY,
  type Seat,
  type TeamListItem,
  type TeamsQueryResponse,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { useCreateSeats, useDeleteSeats } from "./hooks";
import {
  formatLetterRange,
  getFreeSeatLetters,
  getSeatSex,
  getTrailingRemovableSeats,
  sortSeatsByLetter,
} from "./seat-utils";

type Accion = "agregar" | "quitar";
type Alcance = "equipo" | "todos";
type Sexo = "H" | "M";

/** Estado de la fila de un equipo para el sexo elegido. */
type TeamRow = {
  team: TeamListItem;
  label: string;
  /** Asientos actuales, ordenados por letra. */
  seats: Seat[];
  /** Letras libres; la primera es la que sigue. */
  freeLetters: string[];
  /** Asientos que se pueden quitar desde el final (Z → A). */
  removable: Seat[];
  /** Asiento que impide seguir quitando (ocupado o con baja). */
  blockedBy: Seat | null;
};

const labelClass =
  "mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

/** Misma etiqueta que en la cuadrícula del aforo: "Equipo 1 (31-40)". */
function formatTeamLabel(team: TeamListItem) {
  const ageGroup = team.ageGroup?.label;
  return ageGroup ? `${team.teamName} (${ageGroup})` : team.teamName;
}

function getRowCapacity(row: TeamRow, accion: Accion) {
  return accion === "agregar" ? row.freeLetters.length : row.removable.length;
}

/** Letras que se agregarán o quitarán en el equipo, en orden alfabético. */
function getRowChanges(row: TeamRow, accion: Accion, cantidad: number) {
  return accion === "agregar"
    ? row.freeLetters.slice(0, cantidad)
    : row.removable
        .slice(0, cantidad)
        .map((seat) => seat.letter)
        .reverse();
}

/** Explica por qué un equipo no alcanza la cantidad pedida. */
function getRowWarning(
  row: TeamRow,
  accion: Accion,
  cantidad: number,
): string | null {
  const posibles = getRowCapacity(row, accion);
  if (posibles >= cantidad) return null;

  if (accion === "agregar") {
    return posibles === 0
      ? "Ya llega a la Z"
      : `Solo ${posibles === 1 ? "cabe 1" : `caben ${posibles}`} (llega a la Z)`;
  }

  if (row.seats.length === 0) return "Sin asientos";
  if (!row.blockedBy) return null;
  const motivo =
    row.blockedBy.occupied || row.blockedBy.encontrado
      ? "está ocupado"
      : "tiene una baja registrada";
  const prefijo =
    posibles === 0
      ? "No se puede quitar"
      : `Solo ${posibles === 1 ? "se puede quitar 1" : `se pueden quitar ${posibles}`}`;
  return `${prefijo}: el ${row.blockedBy.letter} ${motivo}`;
}

type ChipVariant = "libre" | "ocupado" | "baja" | "nuevo" | "quitar";

const chipVariantClass: Record<Exclude<ChipVariant, "ocupado">, string> = {
  libre:
    "border-gray-300 bg-gray-50 text-app-text-secondary dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
  baja: "border-gray-400/50 bg-gray-500 text-white dark:border-gray-500/55 dark:bg-gray-600",
  nuevo:
    "border-dashed border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300",
  quitar:
    "border-red-400 bg-red-50 text-red-600 line-through dark:border-red-400/70 dark:bg-red-500/15 dark:text-red-300",
};

const chipOcupadoClass: Record<Sexo, string> = {
  H: "border-app-primary/45 bg-app-primary text-white dark:border-app-primary-muted/50 dark:bg-app-primary-muted",
  M: "border-pink-400/45 bg-pink-500 text-white dark:border-pink-400/50 dark:bg-pink-500",
};

function SeatChip({
  letter,
  variant,
  sex,
}: {
  letter: string;
  variant: ChipVariant;
  sex: Sexo;
}) {
  const colorClass =
    variant === "ocupado" ? chipOcupadoClass[sex] : chipVariantClass[variant];
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[0.6875rem] font-medium ${colorClass}`}
    >
      {letter}
    </span>
  );
}

function getExistingVariant(seat: Seat): ChipVariant {
  // Un asiento dado de baja que ya ocupa alguien más cuenta como ocupado.
  if (seat.occupied) return "ocupado";
  return seat.abandoned ? "baja" : "libre";
}

/** Grupo de botones excluyentes (segmented control). */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; activeClass?: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid auto-cols-fr grid-flow-col rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                active
                  ? `bg-white shadow-sm dark:bg-gray-700 ${option.activeClass ?? "text-app-text-primary dark:text-white"}`
                  : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RowWarning({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-amber-600 dark:text-amber-400">
      <HugeiconsIcon icon={Alert02Icon} size={12} className="shrink-0" />
      {text}
    </span>
  );
}

export interface GestionarAsientosModalProps {
  open: boolean;
  onClose: () => void;
  /** Asientos actuales (de SEATS_QUERY) para calcular las letras que siguen. */
  seats: Seat[];
}

/**
 * Modal para agregar o quitar asientos de un equipo o de todos los equipos a
 * la vez, para hombres o mujeres. Muestra la fila actual de cada equipo y las
 * letras que se crearán o borrarán antes de guardar.
 */
export function GestionarAsientosModal({
  open,
  onClose,
  seats,
}: GestionarAsientosModalProps) {
  const [accion, setAccion] = useState<Accion>("agregar");
  const [gender, setGender] = useState<Sexo>("H");
  const [alcance, setAlcance] = useState<Alcance>("equipo");
  const [teamId, setTeamId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const { createSeats, loading: creating } = useCreateSeats();
  const { deleteSeats, loading: deleting } = useDeleteSeats();

  const { data: teamsData, loading: loadingTeams } =
    useQuery<TeamsQueryResponse>(TEAMS_QUERY, {
      skip: !open,
      fetchPolicy: "cache-first",
    });

  useEffect(() => {
    if (!open) return;
    setAccion("agregar");
    setGender("H");
    setAlcance("equipo");
    setTeamId("");
    setCantidad(1);
  }, [open]);

  const teams = useMemo(() => teamsData?.teams ?? [], [teamsData]);

  const rows = useMemo<TeamRow[]>(() => {
    const seatsByTeam = new Map<string, Seat[]>();
    for (const seat of seats) {
      if (!seat.team || getSeatSex(seat) !== gender) continue;
      const list = seatsByTeam.get(seat.team.id) ?? [];
      list.push(seat);
      seatsByTeam.set(seat.team.id, list);
    }
    return teams.map((team) => {
      const teamSeats = sortSeatsByLetter(seatsByTeam.get(team.id) ?? []);
      const { seats: removable, blockedBy } =
        getTrailingRemovableSeats(teamSeats);
      return {
        team,
        label: formatTeamLabel(team),
        seats: teamSeats,
        freeLetters: getFreeSeatLetters(teamSeats.map((s) => s.letter)),
        removable,
        blockedBy,
      };
    });
  }, [seats, teams, gender]);

  const targetRows =
    alcance === "todos" ? rows : rows.filter((row) => row.team.id === teamId);
  const selectedRow = alcance === "equipo" ? (targetRows[0] ?? null) : null;

  const maxCantidad = Math.max(
    0,
    ...targetRows.map((row) => getRowCapacity(row, accion)),
  );
  const n = Math.min(cantidad, Math.max(1, maxCantidad));
  const total = targetRows.reduce(
    (sum, row) => sum + getRowChanges(row, accion, n).length,
    0,
  );
  const equiposAfectados = targetRows.filter(
    (row) => getRowChanges(row, accion, n).length > 0,
  ).length;

  const saving = creating || deleting;
  const busy = saving || loadingTeams;
  const isQuitar = accion === "quitar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total === 0) return;

    const ok = isQuitar
      ? await deleteSeats(
          targetRows.flatMap((row) =>
            row.removable.slice(0, n).map((seat) => seat.id),
          ),
        )
      : await createSeats(
          targetRows.flatMap((row) =>
            getRowChanges(row, accion, n).map((letter) => ({
              letter,
              gender,
              team: { connect: { id: row.team.id } },
            })),
          ),
        );
    if (ok) onClose();
  };

  const asientosLabel = (count: number) =>
    count === 1 ? "1 asiento" : `${count} asientos`;

  const submitLabel = saving
    ? "Guardando…"
    : `${isQuitar ? "Quitar" : "Agregar"} ${total > 0 ? asientosLabel(total) : "asientos"}`;

  const renderSingleTeamPreview = (row: TeamRow) => {
    const changes = getRowChanges(row, accion, n);
    const warning = getRowWarning(row, accion, n);
    const removedIds = new Set(row.removable.slice(0, n).map((s) => s.id));

    const chips = [
      ...row.seats.map((seat) => ({
        key: seat.id,
        letter: seat.letter,
        variant:
          isQuitar && removedIds.has(seat.id)
            ? ("quitar" as const)
            : getExistingVariant(seat),
      })),
      ...(isQuitar
        ? []
        : changes.map((letter) => ({
            key: `nuevo-${letter}`,
            letter,
            variant: "nuevo" as const,
          }))),
    ].sort((a, b) => a.letter.localeCompare(b.letter));

    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-app-text-primary dark:text-gray-200">
          {row.label} · {gender === "H" ? "Hombres" : "Mujeres"}
        </p>
        {chips.length === 0 ? (
          <p className="text-xs text-app-text-secondary dark:text-gray-400">
            Este equipo no tiene asientos.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {chips.map((chip) => (
              <SeatChip
                key={chip.key}
                letter={chip.letter}
                variant={chip.variant}
                sex={gender}
              />
            ))}
          </div>
        )}
        {changes.length > 0 ? (
          <p className="text-xs text-app-text-secondary dark:text-gray-400">
            {isQuitar
              ? changes.length === 1
                ? "Se quitará el asiento "
                : "Se quitarán los asientos "
              : changes.length === 1
                ? "Se agregará el asiento "
                : "Se agregarán los asientos "}
            <span
              className={`font-semibold ${isQuitar ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-300"}`}
            >
              {changes.join(", ")}
            </span>
          </p>
        ) : null}
        {warning ? <RowWarning text={warning} /> : null}
      </div>
    );
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="gestionar-asientos-modal-title"
      panelClassName="flex max-w-lg flex-col overflow-hidden"
      disableBackdropClose={saving}
    >
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2
          id="gestionar-asientos-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Gestionar asientos
        </h2>
        <p className="mt-1 text-xs text-app-text-secondary dark:text-gray-400">
          Agrega o quita asientos al final de la fila de un equipo o de todos.
          Las letras se asignan solas en orden alfabético.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <Segmented<Accion>
            label="Acción"
            value={accion}
            onChange={setAccion}
            disabled={saving}
            options={[
              {
                value: "agregar",
                label: "Agregar",
                activeClass: "text-emerald-700 dark:text-emerald-300",
              },
              {
                value: "quitar",
                label: "Quitar",
                activeClass: "text-red-600 dark:text-red-400",
              },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Segmented<Sexo>
              label="Género"
              value={gender}
              onChange={setGender}
              disabled={saving}
              options={[
                {
                  value: "H",
                  label: "Hombres",
                  activeClass: "text-app-primary dark:text-app-primary-muted",
                },
                {
                  value: "M",
                  label: "Mujeres",
                  activeClass: "text-pink-600 dark:text-pink-400",
                },
              ]}
            />
            <Segmented<Alcance>
              label="Aplicar a"
              value={alcance}
              onChange={setAlcance}
              disabled={saving}
              options={[
                { value: "equipo", label: "Un equipo" },
                { value: "todos", label: "Todos" },
              ]}
            />
          </div>

          {alcance === "equipo" ? (
            <div>
              <label htmlFor="gestionar-asientos-team" className={labelClass}>
                Equipo
              </label>
              <select
                id="gestionar-asientos-team"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className={inputClass}
                disabled={busy || rows.length === 0}
              >
                <option value="">
                  {loadingTeams ? "Cargando equipos…" : "Selecciona un equipo"}
                </option>
                {rows.map((row) => (
                  <option key={row.team.id} value={row.team.id}>
                    {row.label} — {asientosLabel(row.seats.length)}
                    {isQuitar
                      ? row.seats.length > 0
                        ? `, último ${row.seats[row.seats.length - 1].letter}`
                        : ""
                      : row.freeLetters.length > 0
                        ? `, sigue ${row.freeLetters[0]}`
                        : ", completo"}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <span className={labelClass}>
              {alcance === "todos"
                ? "Asientos por equipo"
                : isQuitar
                  ? "Asientos a quitar"
                  : "Asientos a agregar"}
            </span>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]">
                <button
                  type="button"
                  aria-label="Uno menos"
                  onClick={() => setCantidad(n - 1)}
                  disabled={busy || n <= 1}
                  className="rounded-l-xl p-2.5 text-app-text-primary transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={16} />
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold tabular-nums text-app-text-primary dark:text-white"
                  aria-live="polite"
                >
                  {n}
                </span>
                <button
                  type="button"
                  aria-label="Uno más"
                  onClick={() => setCantidad(n + 1)}
                  disabled={busy || n >= maxCantidad}
                  className="rounded-r-xl p-2.5 text-app-text-primary transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={16} />
                </button>
              </div>
              {targetRows.length > 0 ? (
                <span className="text-xs text-app-text-secondary dark:text-gray-400">
                  Máximo {maxCantidad}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/70 p-3 dark:border-gray-700 dark:bg-[#151515]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                Vista previa
              </span>
              {alcance === "todos" && total > 0 ? (
                <span className="text-[0.6875rem] text-app-text-secondary dark:text-gray-400">
                  {asientosLabel(total)} en {equiposAfectados}{" "}
                  {equiposAfectados === 1 ? "equipo" : "equipos"}
                </span>
              ) : null}
            </div>

            {alcance === "equipo" ? (
              selectedRow ? (
                renderSingleTeamPreview(selectedRow)
              ) : (
                <p className="text-xs text-app-text-secondary dark:text-gray-400">
                  Selecciona un equipo para ver su fila de asientos.
                </p>
              )
            ) : rows.length === 0 ? (
              <p className="text-xs text-app-text-secondary dark:text-gray-400">
                {loadingTeams ? "Cargando equipos…" : "No hay equipos."}
              </p>
            ) : (
              <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
                {rows.map((row) => {
                  const changes = getRowChanges(row, accion, n);
                  const warning = getRowWarning(row, accion, n);
                  return (
                    <li key={row.team.id} className="flex items-center gap-3 py-1.5">
                      <span
                        className="w-28 shrink-0 truncate text-xs font-medium text-app-text-primary dark:text-gray-200"
                        title={row.label}
                      >
                        {row.label}
                      </span>
                      <span className="w-10 shrink-0 text-[0.6875rem] tabular-nums text-app-text-secondary dark:text-gray-400">
                        {formatLetterRange(row.seats) || "—"}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                        {changes.map((letter) => (
                          <SeatChip
                            key={letter}
                            letter={letter}
                            variant={isQuitar ? "quitar" : "nuevo"}
                            sex={gender}
                          />
                        ))}
                        {warning ? <RowWarning text={warning} /> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy || total === 0}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isQuitar
                ? "bg-red-600 hover:bg-red-700"
                : "bg-app-primary hover:bg-app-primary/90 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
