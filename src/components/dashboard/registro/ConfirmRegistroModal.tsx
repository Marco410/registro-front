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
import { GlassModal } from "registro/components/shared/GlassModal";

type ConfirmRow = { label: string; value: string };

/**
 * Agrupa los datos del formulario para revisarlos de un vistazo: la persona
 * (nombre, sexo, edad, nacimiento) arriba y tres grupos cortos debajo.
 */
function buildConfirmGroups(
  formData: EncontradoFormData,
  isNinosEvent: boolean,
): { nombreCompleto: string; resumen: string; groups: { title: string; rows: ConfirmRow[] }[] } {
  const nombreCompleto = [formData.nombre, formData.apellido_p, formData.apellido_m]
    .map((parte) => (parte ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const resumen = [
    formData.sexo === "H" ? "Hombre" : "Mujer",
    displayEdad(formData.fecha_n),
    `Nació el ${formatFechaDisplay(formData.fecha_n)}`,
  ].join(" · ");

  const datos: ConfirmRow[] = isNinosEvent
    ? [{ label: "Dirección", value: displayValue(formData.address) }]
    : [
        { label: "Estado civil", value: displayValue(formData.estado_c) },
        { label: "Religión", value: displayValue(formData.religion) },
        { label: "Teléfono", value: displayValue(formData.telefono) },
      ];

  return {
    nombreCompleto: nombreCompleto || "Sin nombre",
    resumen,
    groups: [
      { title: "Datos", rows: datos },
      {
        title: "Contacto de emergencia",
        rows: [
          { label: "Nombre", value: displayValue(formData.nom_ref) },
          { label: "Teléfono", value: displayValue(formData.tel_ref) },
        ],
      },
      {
        title: "Salud",
        rows: [
          { label: "Enfermedad", value: displayValue(formData.enfermedad) },
          { label: "Celular", value: formData.celular ? "Sí" : "No" },
          { label: "Medicamento", value: formData.medicamento ? "Sí" : "No" },
        ],
      },
    ],
  };
}

export interface ConfirmRegistroModalProps {
  open: boolean;
  formData: EncontradoFormData;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onConfirmAndCheckin?: () => void | Promise<void>;
  onConfirmAndPrint?: () => void | Promise<void>;
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
  onConfirmAndPrint,
  onCancel,
}: ConfirmRegistroModalProps) {
  const isNinosEvent = useIsNinosEvent();
  const loadingRef = useRef(loading);
  const onConfirmAndCheckinRef = useRef(onConfirmAndCheckin);
  const onConfirmAndPrintRef = useRef(onConfirmAndPrint);
  const onConfirmRef = useRef(onConfirm);
  const onCancelRef = useRef(onCancel);
  loadingRef.current = loading;
  onConfirmAndCheckinRef.current = onConfirmAndCheckin;
  onConfirmAndPrintRef.current = onConfirmAndPrint;
  onConfirmRef.current = onConfirm;
  onCancelRef.current = onCancel;

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
          onCancelRef.current();
        }
      }
      if ((e.key === "S" || e.key === "s") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onConfirmRef.current();
      }
      if ((e.key === "P" || e.key === "p") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (onConfirmAndPrintRef.current && !loadingRef.current) {
          onConfirmAndPrintRef.current();
          
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  const { nombreCompleto, resumen, groups } = buildConfirmGroups(
    formData,
    isNinosEvent,
  );

  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="confirm-modal-title"
      panelClassName="max-w-3xl max-h-[min(94vh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain p-6"
      disableBackdropClose={loading}
    >
        <h1
          id="confirm-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Confirmar registro
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Revisa los datos antes de guardar.
        </p>
        <div className="mt-4 rounded-xl bg-white/70 p-4 ring-1 ring-gray-200/80 dark:bg-black/20 dark:ring-white/10">
          <p
            className={`text-xl font-semibold tracking-tight ${
              formData.sexo === "H"
                ? "text-app-primary dark:text-app-primary-muted"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {nombreCompleto}
          </p>
          <p className="mt-0.5 text-sm tabular-nums text-app-text-secondary dark:text-gray-400">
            {resumen}
          </p>
          <div className="mt-4 grid gap-x-8 gap-y-5 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-3">
            {groups.map((group) => (
              <section key={group.title}>
                <h2 className="text-xs font-semibold text-app-text-primary dark:text-gray-200">
                  {group.title}
                </h2>
                <dl className="mt-2 space-y-1.5">
                  {group.rows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-app-text-secondary dark:text-gray-400">
                        {label}
                      </dt>
                      <dd className="min-w-0 break-words text-right font-medium text-app-text-primary dark:text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
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
          {isNinosEvent && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirmAndPrint}
              className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-green-50 disabled:opacity-50 dark:border-green-600 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700 text-green-600"
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              {loading ? "Guardando…" : "Guardar e imprimir"}
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                P
                </kbd>
              </span>
            </div>
          )}
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
    </GlassModal>
  );
}
