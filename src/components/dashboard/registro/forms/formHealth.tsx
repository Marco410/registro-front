"use client";

import type { ChangeEvent } from "react";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import {
  getInputClass,
  labelClass,
} from "registro/components/shared/FormInputStyles";

export interface FormHealthIndicatorsProps {
  formData: Pick<EncontradoFormData, "sexo" | "enfermedad">;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  className?: string;
}

/**
 * Sección del formulario: Salud y situación (enfermedad/padecimiento).
 */
export function FormHealthIndicators({
  formData,
  onChange,
  className,
}: FormHealthIndicatorsProps) {
  const sexo = formData.sexo === "M" ? "M" : "H";
  const enfermedad = formData.enfermedad ?? "";
  const inputClass = getInputClass(sexo);

  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${className ?? ""}`.trim()}
    >
      <h2
        className={`mb-5 border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300 ${sexo === "H" ? "border-app-primary" : "border-pink-600"}`}
      >
        Salud
      </h2>
      <div>
        <label htmlFor="enfermedad" className={labelClass}>
          Enfermedad / padecimiento
        </label>
        <textarea
          id="enfermedad"
          name="enfermedad"
          value={enfermedad}
          onChange={onChange}
          className={`${inputClass} min-h-[100px] resize-y`}
          placeholder="Describa si aplica"
          rows={2}
        />
      </div>
    </section>
  );
}
