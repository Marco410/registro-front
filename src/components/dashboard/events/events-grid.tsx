"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, UserEdit01Icon } from "@hugeicons/core-free-icons";
import type { EventListItem, EventTypeValue } from "registro/graphql/events/queries";
import { AnimatedMount } from "registro/components/shared";

export const typeLabels: Record<EventTypeValue, string> = {
  retiro: "Retiro",
  ninos: "Niños",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export interface EventsGridProps {
  events: EventListItem[];
  loading: boolean;
  onEdit: (event: EventListItem) => void;
  onDelete: (event: EventListItem) => void;
}

export function EventsGrid({
  events,
  loading,
  onEdit,
  onDelete,
}: EventsGridProps) {
  if (loading && events.length === 0) {
    return (
      <p className="text-sm text-app-text-secondary dark:text-gray-400">
        Cargando eventos…
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white/50 px-6 py-12 text-center text-sm text-app-text-secondary dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
        No hay eventos. Usa &quot;Agregar evento&quot; para crear el primero.
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
        loading ? "opacity-60" : ""
      }`}
    >
      <AnimatedMount show={true} animationKey="events-grid">
      {events.map((ev) => (
        <article
          key={ev.id}
          className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold leading-snug text-app-text-primary dark:text-white">
                {ev.name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${
                  ev.active
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {ev.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-app-primary dark:text-app-primary-muted">
              {typeLabels[ev.type] ?? ev.type}
            </p>
            {ev.description ? (
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-app-text-secondary dark:text-gray-400">
                {ev.description}
              </p>
            ) : (
              <p className="mt-2 flex-1 text-sm italic text-app-text-secondary/70 dark:text-gray-500">
                Sin descripción
              </p>
            )}
            <p className="mt-3 text-xs text-app-text-secondary dark:text-gray-500">
              Actualizado: {formatDate(ev.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2 border-t border-gray-100 p-3 dark:border-gray-700/80">
            <button
              type="button"
              onClick={() => onEdit(ev)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <HugeiconsIcon icon={UserEdit01Icon} size={18} className="shrink-0" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(ev)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} className="shrink-0" />
              Eliminar
            </button>
          </div>
          </article>
        ))}
      </AnimatedMount>
    </div>
  );
}
