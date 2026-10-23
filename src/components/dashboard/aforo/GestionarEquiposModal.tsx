"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  EQUIPOS_GESTION_QUERY,
  type EquipoGestion,
  type EquiposGestionResponse,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { useManageTeams } from "./hooks";

/** Asientos por sexo del seed (A–O). */
const SEATS_DEFAULT = 15;
const MAX_SEATS_PER_GENDER = 26;

const iconButtonClass =
  "rounded-md p-1.5 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white";

const fieldClass =
  "rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 disabled:opacity-60 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function clampInt(value: string, max: number): number {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 0), max);
}

export interface GestionarEquiposModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal (solo admin) para ordenar los equipos desde el altar hacia atrás —el mismo orden
 * para hombres y mujeres—, eliminar equipos vacíos y agregar equipos al final.
 * El orden se edita en borrador (arrastrando o con ↑/↓) y se guarda de una vez; mientras
 * haya cambios sin guardar, agregar y eliminar quedan en pausa.
 */
export function GestionarEquiposModal({ open, onClose }: GestionarEquiposModalProps) {
  const { data, loading } = useQuery<EquiposGestionResponse>(EQUIPOS_GESTION_QUERY, {
    skip: !open,
    fetchPolicy: "cache-and-network",
  });
  const { reorderTeams, deleteTeam, addTeam, busy, reordering, deleting, adding } =
    useManageTeams();

  const teams = useMemo(() => data?.teams ?? [], [data]);
  const ageGroups = useMemo(() => data?.ageGroups ?? [], [data]);
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const [draft, setDraft] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newAgeGroupId, setNewAgeGroupId] = useState("");
  const [newSeatsH, setNewSeatsH] = useState(SEATS_DEFAULT);
  const [newSeatsM, setNewSeatsM] = useState(SEATS_DEFAULT);

  // El borrador se reinicia cada vez que llega la lista del servidor (al abrir y tras
  // guardar, agregar o eliminar). Para agregar se proponen los asientos del último
  // equipo (o 15/15 del seed si no hay equipos).
  useEffect(() => {
    setDraft(teams.map((t) => t.id));
    setConfirmDeleteId(null);
    const last = teams[teams.length - 1];
    setNewSeatsH(last ? last.hombres : SEATS_DEFAULT);
    setNewSeatsM(last ? last.mujeres : SEATS_DEFAULT);
  }, [teams]);

  useEffect(() => {
    if (!newAgeGroupId && ageGroups[0]) setNewAgeGroupId(ageGroups[0].id);
  }, [ageGroups, newAgeGroupId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onClose]);

  const original = teams.map((t) => t.id);
  const dirty = draft.join() !== original.join();
  const rows = draft
    .map((id) => teamById.get(id))
    .filter((t): t is EquipoGestion => Boolean(t));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.length || from === to) return;
    setDraft((prev) => moveItem(prev, from, to));
  };

  const handleDrop = (to: number) => {
    if (dragIndex != null) move(dragIndex, to);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDelete = async (team: EquipoGestion) => {
    const ok = await deleteTeam(team.id, team.teamName);
    if (!ok) setConfirmDeleteId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgeGroupId) return;
    await addTeam({
      ageGroupId: newAgeGroupId,
      seatsHombres: newSeatsH,
      seatsMujeres: newSeatsM,
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="gestionar-equipos-title"
      panelClassName="flex max-w-2xl flex-col overflow-hidden"
      disableBackdropClose={busy}
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div>
          <h2
            id="gestionar-equipos-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Gestionar equipos
          </h2>
          <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
            Ordena desde el altar hacia atrás, arrastrando o con las flechas. El
            orden es el mismo para hombres y mujeres.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Cerrar"
          className="-mr-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-y border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1e1f22]">
        <p className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 py-1.5 text-center text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-app-text-secondary dark:border-gray-800 dark:bg-[#26272a] dark:text-gray-400">
          Altar
        </p>
        {loading && !data ? (
          <div className="space-y-2 p-4" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-app-text-secondary dark:text-gray-400">
            No hay equipos. Agrega uno abajo o genéralos en Base de datos.
          </p>
        ) : (
          <ol className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((team, index) => {
              const confirming = confirmDeleteId === team.id;
              const canDelete = team.conPersonas === 0;
              const isDragging = dragIndex === index;
              const isOver =
                overIndex === index && dragIndex != null && dragIndex !== index;
              return (
                <li
                  key={team.id}
                  draggable={!busy && !confirming}
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overIndex !== index) setOverIndex(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                    isDragging ? "opacity-40" : ""
                  } ${
                    isOver
                      ? dragIndex != null && dragIndex > index
                        ? "shadow-[inset_0_2px_0_0_rgb(26,115,232)]"
                        : "shadow-[inset_0_-2px_0_0_rgb(26,115,232)]"
                      : ""
                  } ${confirming ? "bg-red-50/70 dark:bg-red-500/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}
                >
                  <span
                    className="cursor-grab text-gray-400 active:cursor-grabbing dark:text-gray-500"
                    aria-hidden
                  >
                    <HugeiconsIcon icon={DragDropVerticalIcon} size={16} />
                  </span>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-app-text-primary dark:text-gray-100">
                      {team.teamName}
                      {team.ageGroup?.label ? (
                        <span className="font-normal text-app-text-secondary dark:text-gray-400">
                          {" "}
                          · {team.ageGroup.label}
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                      {team.hombres} H · {team.mujeres} M
                      {team.conPersonas > 0
                        ? ` · ${team.conPersonas} con personas`
                        : " · vacío"}
                    </span>
                  </span>

                  {confirming ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        ¿Eliminar?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deleting}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-app-text-secondary hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(team)}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? "Eliminando…" : "Eliminar"}
                      </button>
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={busy || index === 0}
                        aria-label={`Subir ${team.teamName}`}
                        title="Subir (más cerca del altar)"
                        className={iconButtonClass}
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={busy || index === rows.length - 1}
                        aria-label={`Bajar ${team.teamName}`}
                        title="Bajar (más lejos del altar)"
                        className={iconButtonClass}
                      >
                        <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(team.id)}
                        disabled={busy || dirty || !canDelete}
                        aria-label={`Eliminar ${team.teamName}`}
                        title={
                          !canDelete
                            ? `No se puede eliminar: ${team.conPersonas} asiento(s) con personas o bajas`
                            : dirty
                              ? "Guarda o descarta el nuevo orden primero"
                              : "Eliminar equipo"
                        }
                        className={`${iconButtonClass} ml-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400`}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-app-text-secondary dark:text-gray-400">
            {dirty
              ? "Tienes cambios de orden sin guardar."
              : `${rows.length} ${rows.length === 1 ? "equipo" : "equipos"}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft(original)}
              disabled={!dirty || busy}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-app-text-secondary transition-colors hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => void reorderTeams(draft)}
              disabled={!dirty || busy}
              className="rounded-lg bg-app-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-app-primary-muted dark:text-gray-900"
            >
              {reordering ? "Guardando…" : "Guardar orden"}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAdd}
          className="flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <div className="min-w-[10rem] flex-1">
            <label
              htmlFor="nuevo-equipo-grupo"
              className="mb-1 block text-xs font-medium text-app-text-secondary dark:text-gray-400"
            >
              Agregar equipo al final
            </label>
            <select
              id="nuevo-equipo-grupo"
              value={newAgeGroupId}
              onChange={(e) => setNewAgeGroupId(e.target.value)}
              disabled={busy || dirty || ageGroups.length === 0}
              className={`${fieldClass} w-full`}
            >
              {ageGroups.length === 0 ? (
                <option value="">Sin grupos de edad</option>
              ) : null}
              {ageGroups.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.label}
                </option>
              ))}
            </select>
          </div>
          <label className="text-xs font-medium text-app-text-secondary dark:text-gray-400">
            <span className="mb-1 block">Hombres</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SEATS_PER_GENDER}
              value={newSeatsH}
              onChange={(e) => setNewSeatsH(clampInt(e.target.value, MAX_SEATS_PER_GENDER))}
              disabled={busy || dirty}
              className={`${fieldClass} w-20 text-right tabular-nums`}
            />
          </label>
          <label className="text-xs font-medium text-app-text-secondary dark:text-gray-400">
            <span className="mb-1 block">Mujeres</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SEATS_PER_GENDER}
              value={newSeatsM}
              onChange={(e) => setNewSeatsM(clampInt(e.target.value, MAX_SEATS_PER_GENDER))}
              disabled={busy || dirty}
              className={`${fieldClass} w-20 text-right tabular-nums`}
            />
          </label>
          <button
            type="submit"
            disabled={busy || dirty || !newAgeGroupId || newSeatsH + newSeatsM === 0}
            title={dirty ? "Guarda o descarta el nuevo orden primero" : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-app-text-primary shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            {adding ? "Agregando…" : "Agregar"}
          </button>
        </form>
      </div>
    </GlassModal>
  );
}
