"use client";

import { GlassModal } from "registro/components/shared/GlassModal";

export interface ConfirmEliminarAsientoModalProps {
  open: boolean;
  /** Ej. "Equipo 1 · Hombres · P" */
  seatLabel: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmEliminarAsientoModal({
  open,
  seatLabel,
  loading,
  onConfirm,
  onCancel,
}: ConfirmEliminarAsientoModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="eliminar-asiento-modal-title"
      panelClassName="max-w-sm p-6"
      disableBackdropClose={loading}
    >
      <h2
        id="eliminar-asiento-modal-title"
        className="text-lg font-semibold text-app-text-primary dark:text-white"
      >
        ¿Eliminar este asiento?
      </h2>
      <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
        Se borrará el asiento <strong>{seatLabel}</strong>. Puedes volver a
        crearlo desde «Gestionar asientos».
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm()}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
        >
          {loading ? "Eliminando…" : "Eliminar asiento"}
        </button>
      </div>
    </GlassModal>
  );
}
