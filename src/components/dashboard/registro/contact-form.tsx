"use client";

import type { ChangeEvent } from "react";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import {
  getInputClass,
  labelClass,
} from "registro/components/dashboard/registro/form-input-styles";

export interface ContactFormProps {
  formData: Pick<EncontradoFormData, "sexo" | "nom_ref" | "tel_ref">;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  className?: string;
}

/**
 * Sección del formulario: Contacto (referente y teléfono del referente).
 */
export function ContactForm({
  formData,
  onChange,
  className,
}: ContactFormProps) {
  const sexo = formData.sexo === "F" ? "F" : "M";
  const nomRef = formData.nom_ref ?? "";
  const telRef = formData.tel_ref ?? "";
  const inputClass = getInputClass(sexo);

  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${className ?? ""}`.trim()}
    >
      <h2
        className={`mb-5 border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300 ${sexo === "M" ? "border-app-primary" : "border-pink-600"}`}
      >
        Contacto
      </h2>
      <div className="grid gap-4 sm:grid-cols-1">
        <div>
          <label htmlFor="nom_ref" className={labelClass}>
            Nombre del referente
          </label>
          <input
            id="nom_ref"
            name="nom_ref"
            type="text"
            value={nomRef}
            onChange={onChange}
            className={inputClass}
            placeholder="Persona de referencia"
          />
        </div>
        <div>
          <label htmlFor="tel_ref" className={labelClass}>
            Teléfono del referente
          </label>
          <input
            id="tel_ref"
            name="tel_ref"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={telRef}
            onChange={onChange}
            className={inputClass}
            placeholder="Teléfono del referente"
          />
        </div>
      </div>
    </section>
  );
}
