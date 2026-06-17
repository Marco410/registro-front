"use client";

import { GlassModal } from "registro/components/shared/GlassModal";

export interface ConfirmDarDeBajaModalProps {
  open: boolean;
  ocupadoPor: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDarDeBajaModal({
  open,
  ocupadoPor,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDarDeBajaModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="dar-de-baja-modal-title"
      panelClassName="max-w-sm p-6"
      disableBackdropClose={loading}
    >
        <h2
          id="dar-de-baja-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Dar de baja este asiento?
        </h2>
        <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
          Se marcará el asiento como abandonado y se desocupará. El encontrado{" "}
          {ocupadoPor ? <strong>{ocupadoPor}</strong> : "asignado"} quedará
          registrado como quien abandonó el asiento.
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
            {loading ? "Guardando…" : "Dar de baja"}
          </button>
        </div>
    </GlassModal>
  );
}
