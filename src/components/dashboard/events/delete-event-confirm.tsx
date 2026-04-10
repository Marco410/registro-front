"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { DELETE_EVENT_MUTATION } from "registro/graphql/events/mutations";
import {
  EVENTS_QUERY,
  type EventListItem,
} from "registro/graphql/events/queries";
import { useActiveEvent } from "registro/contexts/active-event-context";

export interface DeleteEventConfirmProps {
  target: EventListItem | null;
  onClose: () => void;
}

export function DeleteEventConfirm({ target, onClose }: DeleteEventConfirmProps) {
  const { clearIfMatches } = useActiveEvent();
  const [deleteEvent, { loading: deleting }] = useMutation(
    DELETE_EVENT_MUTATION,
    {
      refetchQueries: [{ query: EVENTS_QUERY }],
      onError: (err) => {
        toast.error(err.message ?? "Error al eliminar el evento");
      },
    },
  );

  if (!target) return null;

  const handleConfirm = () => {
    const id = target.id;
    deleteEvent({
      variables: { where: { id } },
      onCompleted: () => {
        clearIfMatches(id);
        toast.success("Evento eliminado");
        onClose();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-event-title"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-xl dark:border-gray-700 dark:bg-[#202124]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-delete-event-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Eliminar evento?
        </h2>
        <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
          Se eliminará <strong>{target.name}</strong>. Esta acción no se puede
          deshacer.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
