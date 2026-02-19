"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  displayEdad,
  displayValue,
  formatFechaDisplay,
} from "registro/lib/helpers/encontrado-display";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";

function buildConfirmRows(
  formData: EncontradoFormData,
): { label: string; value: string }[] {
  return [
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
    { label: "Estado civil", value: displayValue(formData.estado_c) },
    { label: "Religión", value: displayValue(formData.religion) },
    { label: "Teléfono", value: displayValue(formData.telefono) },
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
  onCancel,
}: ConfirmRegistroModalProps) {
  if (!open) return null;

  const rows = buildConfirmRows(formData);

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
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 ${
              formData.sexo === "H"
                ? "bg-app-primary hover:bg-app-primary/90"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            {loading ? "Guardando…" : "Confirmar y guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
