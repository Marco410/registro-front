"use client";

import { Checkbox } from "registro/components/shared";

export interface CheckinOptionsFormProps {
  sexo: "H" | "M";
  celular: boolean;
  medicamento: boolean;
  onCelularChange: (value: boolean) => void;
  onMedicamentoChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Formulario de opciones de check-in: ¿Tiene celular? ¿Tiene medicamento?
 */
export function CheckinOptionsForm({
  sexo,
  celular,
  medicamento,
  onCelularChange,
  onMedicamentoChange,
  disabled,
  className,
}: CheckinOptionsFormProps) {
  const borderClass =
    sexo === "M"
      ? "border-pink-500 dark:border-pink-400"
      : "border-app-primary dark:border-app-primary-muted";

  return (
    <section
      className={`rounded-2xl border-l-4 border-gray-200 bg-app-sidebar p-4 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${borderClass} ${className ?? ""}`.trim()}
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
        Antes del check-in
      </h3>
      <div className="flex flex-wrap gap-6">
        <Checkbox
          sexo={sexo}
          label="¿Tiene celular?"
          checked={celular}
          onChange={(e) => onCelularChange(e.target.checked)}
          disabled={disabled}
        />
        <Checkbox
          sexo={sexo}
          label="¿Tiene medicamento?"
          checked={medicamento}
          onChange={(e) => onMedicamentoChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
    </section>
  );
}
