"use client";

import type { ChangeEvent } from "react";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import { Checkbox } from "registro/components/shared";
import {
  getFormSectionClass,
  getInputClass,
  labelClass,
} from "registro/components/shared/FormInputStyles";

export interface FormHealthIndicatorsProps {
  formData: Pick<
    EncontradoFormData,
    "sexo" | "enfermedad" | "celular" | "medicamento"
  >;
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
  const celular = formData.celular;
  const medicamento = formData.medicamento;
  const inputClass = getInputClass(sexo);

  return (
    <section className={getFormSectionClass(sexo, className)}>
      <h2
        className={`border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300 ${sexo === "H" ? "border-app-primary" : "border-pink-600"}`}
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
          className={`${inputClass} min-h-[50px] resize-y`}
          placeholder="Describa si aplica"
        />
      </div>
      <div className="mt-4 flex flex-row flex-wrap gap-6">
        <Checkbox
          sexo={sexo}
          label="¿Tiene celular?"
          name="celular"
          checked={celular}
          onChange={(e) => onChange(e as ChangeEvent<HTMLInputElement>)}
        />
        <Checkbox
          sexo={sexo}
          label="¿Tiene medicamento?"
          name="medicamento"
          checked={medicamento}
          onChange={(e) => onChange(e as ChangeEvent<HTMLInputElement>)}
        />
      </div>
    </section>
  );
}
