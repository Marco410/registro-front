"use client";

import { GlassModal } from "registro/components/shared/GlassModal";

export interface CerrarSesionUsuarioModalProps {
  open: boolean;
  /** Ej. "Ana López (ana.lopez)" */
  userLabel: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/** Confirmación antes de cerrar todas las sesiones de un usuario. */
export function CerrarSesionUsuarioModal({
  open,
  userLabel,
  loading,
  onConfirm,
  onCancel,
}: CerrarSesionUsuarioModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="cerrar-sesion-usuario-title"
      panelClassName="max-w-sm p-6"
      disableBackdropClose={loading}
    >
      <h2
        id="cerrar-sesion-usuario-title"
        className="text-lg font-semibold text-app-text-primary dark:text-white"
      >
        ¿Cerrar la sesión de este usuario?
      </h2>
      <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
        <strong className="text-app-text-primary dark:text-gray-200">
          {userLabel}
        </strong>{" "}
        saldrá del sistema en todos sus equipos en menos de un minuto y tendrá
        que volver a iniciar sesión. Lo que esté capturando sin guardar se
        perderá.
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
          {loading ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </div>
    </GlassModal>
  );
}
