"use client";

import { useEffect, useRef } from "react";

export interface DiscardChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

/**
 * Modal para confirmar si el usuario desea descartar los cambios del formulario
 * (al limpiar o al navegar con datos sin guardar).
 */
export function DiscardChangesModal({
  open,
  onClose,
  onConfirmDiscard,
}: DiscardChangesModalProps) {
  const onConfirmDiscardRef = useRef(onConfirmDiscard);
  onConfirmDiscardRef.current = onConfirmDiscard;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirmDiscardRef.current?.();
      }
      if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-xl dark:border-gray-700 dark:bg-[#202124]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="discard-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Descartar cambios?
        </h2>
        <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
          Hay datos en el formulario. ¿Desea descartarlos o seguir editando?
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
              Seguir editando
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
                <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">Backspace</kbd> o <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">ESC</kbd>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onConfirmDiscard}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
              Descartar cambios
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">Enter</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
