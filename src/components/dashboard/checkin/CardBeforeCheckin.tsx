"use client";

import { useEffect, useRef, useState } from "react";
import { EncontradoListItem } from "registro/graphql/encontrados/queries";
import { CheckinOptionsForm } from "./checkinOptionsForm";
import { EditEncontradoModal } from "../registro";
import { useAuth } from "registro/contexts/auth-context";
import { AnimatedMount } from "registro/components/shared";

export interface CardBeforeCheckinProps {
  selected: EncontradoListItem;
  sexo: "H" | "M";
  celular: boolean;
  medicamento: boolean;
  onCelularChange: (value: boolean) => void;
  onMedicamentoChange: (value: boolean) => void;
  onSaveOptions: () => void | Promise<void>;
  onDoCheckin: () => void | Promise<void>;
  savingOptions: boolean;
  performingCheckin: boolean;
  onCancel: () => void;
  onSelectedUpdate?: (item: EncontradoListItem) => void;
  /** Pausa los atajos de teclado (por ejemplo, con otro modal abierto encima). */
  shortcutsDisabled?: boolean;
}

/**
 * Tarjeta con el formulario de opciones (celular, medicamento) y los botones
 * "Guardar opciones" y "Hacer check-in".
 */
export function CardBeforeCheckin({
  selected,
  sexo,
  celular,
  medicamento,
  onCelularChange,
  onMedicamentoChange,
  onSaveOptions,
  onDoCheckin,
  savingOptions,
  performingCheckin,
  onCancel,
  onSelectedUpdate,
  shortcutsDisabled = false,
}: CardBeforeCheckinProps) {
  const isHombre = sexo === "H";
  const hasCheckin = Boolean(selected.checkins?.checkinAt);
  const checkinButtonLabel = performingCheckin
    ? "Procesando…"
    : hasCheckin
      ? "Ver check-in"
      : "Hacer check-in";
  const onCancelRef = useRef(onCancel);
  const onDoCheckinRef = useRef(onDoCheckin);
  const onSaveOptionsRef = useRef(onSaveOptions);
  const performingCheckinRef = useRef(performingCheckin);
  const savingOptionsRef = useRef(savingOptions);
  const selectedIdRef = useRef(selected.id);
  const shortcutsDisabledRef = useRef(shortcutsDisabled);
  const [editingEncontradoId, setEditingEncontradoId] = useState<string | null>(
    null,
  );
  const { user } = useAuth();
  onCancelRef.current = onCancel;
  onDoCheckinRef.current = onDoCheckin;
  onSaveOptionsRef.current = onSaveOptions;
  performingCheckinRef.current = performingCheckin;
  savingOptionsRef.current = savingOptions;
  selectedIdRef.current = selected.id;
  shortcutsDisabledRef.current = shortcutsDisabled;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shortcutsDisabledRef.current) return;
      if (
        (e.key === "S" || e.key === "s") &&
        (e.ctrlKey || e.metaKey) &&
        !savingOptionsRef.current &&
        !performingCheckinRef.current
      ) {
        e.preventDefault();
        onSaveOptionsRef.current?.();
      }
      if (
        e.key === "Enter" &&
        (e.ctrlKey || e.metaKey) &&
        !performingCheckinRef.current
      ) {
        e.preventDefault();
        onDoCheckinRef.current?.();
      }
      if (e.key === "Escape" && !performingCheckinRef.current) {
        e.preventDefault();
        onCancelRef.current?.();
      }
      if ((e.key === "E" || e.key === "e") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setEditingEncontradoId(selectedIdRef.current);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const kbdClass =
    "rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800";

  return (
    <>
      <AnimatedMount show={selected != null} animationKey={selected?.id}>
        <div className="flex flex-col gap-8">
          <CheckinOptionsForm
            selected={selected}
            sexo={sexo}
            celular={celular}
            medicamento={medicamento}
            onCelularChange={onCelularChange}
            onMedicamentoChange={onMedicamentoChange}
            disabled={performingCheckin}
            onCancel={onCancel}
          />

          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex flex-row gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={onSaveOptions}
                  disabled={savingOptions || performingCheckin}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {savingOptions ? "Guardando…" : "Guardar opciones"}
                </button>
                <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                  <kbd className={kbdClass}>Ctrl</kbd> +{" "}
                  <kbd className={kbdClass}>S</kbd>
                </span>
              </div>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setEditingEncontradoId(selected.id)}
                  disabled={performingCheckin}
                  className="rounded-xl border border-blue-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-600 dark:hover:bg-blue-700"
                >
                  Editar registro
                </button>
                <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                  <kbd className={kbdClass}>Ctrl</kbd> +{" "}
                  <kbd className={kbdClass}>E</kbd>
                </span>
              </div>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={onDoCheckin}
                  disabled={performingCheckin}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors disabled:opacity-60 ${isHombre ? "bg-app-primary hover:bg-app-primary/90" : "bg-pink-600 hover:bg-pink-700"}`}
                >
                  {checkinButtonLabel}
                </button>
                <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                  <kbd className={kbdClass}>Ctrl</kbd> +{" "}
                  <kbd className={kbdClass}>Enter</kbd>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onCancel}
                disabled={performingCheckin}
                title="Ctrl+Esc o Ctrl+Backspace"
                className="w-full rounded-xl border border-red-300 px-6 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-600 dark:hover:bg-red-700"
              >
                Cancelar
              </button>
              <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                <kbd className={kbdClass}>Esc</kbd>
              </span>
            </div>
          </div>
        </div>
      </AnimatedMount>

      <EditEncontradoModal
        open={editingEncontradoId != null}
        encontradoId={editingEncontradoId}
        userId={user?.id ?? ""}
        onClose={() => setEditingEncontradoId(null)}
        onSaved={(updated) => {
          onSelectedUpdate?.(updated);
          setEditingEncontradoId(null);
        }}
      />
    </>
  );
}
