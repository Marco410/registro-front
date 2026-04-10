"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, CalendarCheckIn01Icon } from "@hugeicons/core-free-icons";
import {
  displayEdad,
  displayValue,
  formatFechaDisplay,
} from "registro/lib/helpers/encontrado-display";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import { useIsNinosEvent } from "registro/contexts/active-event-context";

function buildConfirmRows(
  formData: EncontradoFormData,
  isNinosEvent: boolean,
): { label: string; value: string }[] {
  const base: { label: string; value: string }[] = [
    { label: "Nombre", value: displayValue(formData.nombre) },
    { label: "Apellido paterno", value: displayValue(formData.apellido_p) },
    { label: "Apellido materno", value: displayValue(formData.apellido_m) },
    {
      label: "Sexo",
      value: formData.sexo === "H" ? "Hombre" : "Mujer",
    },
    {
      label: "Fecha de nacimiento",
      value: formatFechaDisplay(formData.fecha_n),
    },
    { label: "Edad", value: displayEdad(formData.fecha_n) },
  ];
  if (isNinosEvent) {
    base.push({
      label: "Dirección",
      value: displayValue(formData.address),
    });
  } else {
    base.push(
      { label: "Estado civil", value: displayValue(formData.estado_c) },
      { label: "Religión", value: displayValue(formData.religion) },
      { label: "Teléfono", value: displayValue(formData.telefono) },
    );
  }
  return [
    ...base,
    { label: "Nombre del referido", value: displayValue(formData.nom_ref) },
    { label: "Teléfono del referido", value: displayValue(formData.tel_ref) },
    {
      label: "Enfermedad / padecimiento",
      value: displayValue(formData.enfermedad),
    },
    {
      label: "Tiene celular",
      value: formData.celular ? "Sí" : "No",
    },
    {
      label: "Tiene medicamento",
      value: formData.medicamento ? "Sí" : "No",
    },
  ];
}

export interface ConfirmRegistroModalProps {
  open: boolean;
  formData: EncontradoFormData;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  /** Registrar y luego hacer check-in; redirige a la pestaña Check-in con el resultado. */
  onConfirmAndCheckin?: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Modal de confirmación que muestra los datos del formulario de registro
 * para que el usuario revise antes de guardar.
 */
export function ConfirmRegistroModal({
  open,
  formData,
  loading,
  onConfirm,
  onConfirmAndCheckin,
  onCancel,
}: ConfirmRegistroModalProps) {
  const isNinosEvent = useIsNinosEvent();
  const loadingRef = useRef(loading);
  const onConfirmAndCheckinRef = useRef(onConfirmAndCheckin);
  loadingRef.current = loading;
  onConfirmAndCheckinRef.current = onConfirmAndCheckin;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (onConfirmAndCheckinRef.current && !loadingRef.current) {
          onConfirmAndCheckinRef.current();
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (!loadingRef.current) {
          onCancel();
        }
      }
      if ((e.key === "S" || e.key === "s") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  if (!open) return null;

  const rows = buildConfirmRows(formData, isNinosEvent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-xl dark:border-gray-700 dark:bg-[#202124]"
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          id="confirm-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Confirmar registro
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Revise los datos antes de guardar.
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-x-6 gap-y-4 rounded-xl bg-white/50 py-4 pl-4 pr-4 dark:bg-black/20">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
            >
              <dt className="text-sm font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
                {label}
              </dt>
              <dd className="text-base font-medium text-app-text-primary break-words dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-700"
            >
              Cancelar
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                ESC
              </kbd>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              {loading ? "Guardando…" : "Confirmar y guardar"}
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                S
              </kbd>
            </span>
          </div>
          {onConfirmAndCheckin && (
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirmAndCheckin}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 ${
                  formData.sexo === "H"
                    ? "bg-app-primary hover:bg-app-primary/90"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                <HugeiconsIcon icon={CalendarCheckIn01Icon} size={18} />
                {loading ? "Guardando…" : "Registrar y hacer check-in"}
              </button>
              <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
                <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  Enter
                </kbd>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
