"use client";

import { useEffect, useRef } from "react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlassModal } from "registro/components/shared/GlassModal";

export interface DiscardChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

const kbdClass =
  "rounded-md border border-white/50 bg-white/60 px-1.5 py-0.5 font-mono text-[0.625rem] font-medium shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/10";

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
  }, [open, onClose]);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="discard-modal-title"
      panelClassName="max-w-md overflow-hidden p-0"
    >
      <div className="border-b border-white/30 px-6 py-5 dark:border-white/10">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <HugeiconsIcon icon={AlertCircleIcon} size={22} />
          </span>
          <div className="min-w-0">
            <h2
              id="discard-modal-title"
              className="text-lg font-semibold leading-snug text-app-text-primary dark:text-white"
            >
              ¿Descartar cambios?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-app-text-secondary dark:text-gray-400">
              Hay datos en el formulario. ¿Desea descartarlos o seguir editando?
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-2.5 text-sm font-medium text-app-text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-white/70 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
          >
            Seguir editando
          </button>
          <span className="select-none text-center text-xs text-app-text-secondary dark:text-gray-400">
            <kbd className={kbdClass}>Backspace</kbd>
            {" o "}
            <kbd className={kbdClass}>ESC</kbd>
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onConfirmDiscard}
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Descartar cambios
          </button>
          <span className="select-none text-xs text-app-text-secondary dark:text-gray-400">
            <kbd className={kbdClass}>Enter</kbd>
          </span>
        </div>
      </div>
    </GlassModal>
  );
}
