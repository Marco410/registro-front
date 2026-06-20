"use client";

import { GlassModal } from "registro/components/shared/GlassModal";

export interface ConfirmQuitarCheckinModalProps {
  open: boolean;
  ocupadoPor: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmQuitarCheckinModal({
  open,
  ocupadoPor,
  loading,
  onConfirm,
  onCancel,
}: ConfirmQuitarCheckinModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="quitar-checkin-modal-title"
      panelClassName="max-w-sm p-6"
      disableBackdropClose={loading}
    >
      <h2
        id="quitar-checkin-modal-title"
        className="text-lg font-semibold text-app-text-primary dark:text-white"
      >
        ¿Quitar check-in?
      </h2>
      <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
        Se eliminará el check-in de{" "}
        {ocupadoPor ? <strong>{ocupadoPor}</strong> : "este encontrado"}.
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
          className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          {loading ? "Quitando…" : "Quitar check-in"}
        </button>
      </div>
    </GlassModal>
  );
}
