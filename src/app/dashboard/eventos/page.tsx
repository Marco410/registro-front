"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { EventsGrid } from "registro/components/dashboard/events/events-grid";
import { EventFormModal } from "registro/components/dashboard/events/event-form-modal";
import { DeleteEventConfirm } from "registro/components/dashboard/events/delete-event-confirm";
import {
  EVENTS_QUERY,
  type EventListItem,
  type EventsQueryResponse,
} from "registro/graphql/events/queries";

export default function DashboardEventosPage() {
  const { data, loading, error } = useQuery<EventsQueryResponse>(EVENTS_QUERY);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventListItem | null>(null);

  const events = data?.events ?? [];

  const openCreate = () => {
    setFormMode("create");
    setEditingEvent(null);
    setFormOpen(true);
  };

  const openEdit = (ev: EventListItem) => {
    setFormMode("edit");
    setEditingEvent(ev);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex flex-col gap-4 border-l-4 border-app-primary pl-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
            Eventos
          </h1>
          <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
            Gestiona eventos por tipo (retiro o niños), estado activo y
            descripción.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-app-primary/90 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
        >
          <HugeiconsIcon icon={Add01Icon} size={20} className="shrink-0" />
          Agregar evento
        </button>
      </div>

      <div className="relative mt-8">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar eventos
          </p>
        ) : (
          <>
            {loading && events.length > 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/60 pt-16 dark:bg-gray-900/50"
                aria-hidden="true"
              >
                <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-app-text-secondary shadow dark:bg-gray-800 dark:text-gray-400">
                  Actualizando…
                </span>
              </div>
            )}
            <EventsGrid
              events={events}
              loading={loading}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          </>
        )}

        {events.length > 0 && !error && (
          <p className="mt-4 text-sm text-app-text-secondary dark:text-gray-400">
            {events.length} evento{events.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <EventFormModal
        open={formOpen}
        mode={formMode}
        event={editingEvent}
        onClose={closeForm}
      />
      <DeleteEventConfirm
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
