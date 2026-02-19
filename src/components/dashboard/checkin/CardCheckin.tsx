"use client";

import { EncontradoListItem } from "registro/graphql/encontrados/queries";
import { CheckinOptionsForm } from "./checkinOptionsForm";

export interface CardCheckinProps {
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
}

/**
 * Tarjeta con el formulario de opciones (celular, medicamento) y los botones
 * "Guardar opciones" y "Hacer check-in".
 */
export function CardCheckin({
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
}: CardCheckinProps) {
  const isHombre = sexo === "H";

  return (
    <div className="flex flex-col gap-6">
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSaveOptions}
          disabled={savingOptions || performingCheckin}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {savingOptions ? "Guardando…" : "Guardar opciones"}
        </button>
        <button
          type="button"
          onClick={onDoCheckin}
          disabled={performingCheckin}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors disabled:opacity-60 ${isHombre ? "bg-app-primary hover:bg-app-primary/90" : "bg-pink-600 hover:bg-pink-700"}`}
        >
          {performingCheckin ? "Procesando…" : "Hacer check-in"}
        </button>
      </div>
    </div>
  );
}
