"use client";

import type { ChangeEvent } from "react";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import {
  getFormSectionClass,
  getInputClass,
  inputError,
  labelClass,
} from "registro/components/shared/FormInputStyles";
import { useActiveEvent } from "registro/contexts/active-event-context";

export interface ContactFormProps {
  formData: Pick<EncontradoFormData, "sexo" | "nom_ref" | "tel_ref">;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  errors?: Partial<Record<"nom_ref" | "tel_ref", string>>;
  className?: string;
}

/**
 * Sección del formulario: Contacto (referente y teléfono del referente).
 */
export function ContactForm({
  formData,
  onChange,
  errors = {},
  className,
}: ContactFormProps) {
  const sexo = formData.sexo === "M" ? "M" : "H";
  const nomRef = formData.nom_ref ?? "";
  const telRef = formData.tel_ref ?? "";
  const inputClass = getInputClass(sexo);


  return (
    <section
      className={getFormSectionClass(
        sexo,
        `[container-type:inline-size] ${className ?? ""}`,
      )}
    >
      <div>
        <h2
          className={`border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300 ${sexo === "H" ? "border-app-primary" : "border-pink-600"}`}
        >
          Contacto de Emergencia
        </h2>
        <small className="mt-1 block pl-4 text-xs text-app-text-secondary dark:text-gray-400">
          Nombre y teléfono de una persona de confianza que pueda ayudar en caso
          de emergencia.
        </small>
      </div>
      {/*
        Con la sección a ≥26rem, nombre y teléfono van en una sola fila. Las
        etiquetas visibles son cortas (el título ya dice de quién son); el
        texto completo queda para lectores de pantalla.
      */}
      <div className="grid gap-4 [@container(min-width:26rem)]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <label htmlFor="nom_ref" className={labelClass}>
            Nombre<span className="sr-only"> del contacto de emergencia</span> *
          </label>
          <input
            id="nom_ref"
            name="nom_ref"
            type="text"
            value={nomRef}
            onChange={onChange}
            className={`${inputClass} ${errors.nom_ref ? inputError : ""}`}
            placeholder="Nombre completo"
          />
          {errors.nom_ref && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.nom_ref}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="tel_ref" className={labelClass}>
            Teléfono<span className="sr-only"> del contacto de emergencia</span> *
          </label>
          <input
            id="tel_ref"
            name="tel_ref"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={telRef}
            onChange={onChange}
            className={`${inputClass} ${errors.tel_ref ? inputError : ""}`}
            placeholder="10 dígitos"
          />
          {errors.tel_ref && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.tel_ref}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
