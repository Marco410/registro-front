"use client";

import { useCallback } from "react";
import type { ChangeEvent } from "react";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import { getAgeFromFechaN } from "registro/lib/helpers/encontrado-display";
import {
  getInputClass,
  inputError,
  labelClass,
} from "registro/components/shared/formInputStyles";

export interface FechaInputs {
  dia: string;
  mes: string;
  ano: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1920;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildFechaN(day: number, month: number, year: number): string {
  const maxDay = getDaysInMonth(year, month);
  const d = Math.min(Math.max(1, day), maxDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function validateFechaNacimiento(
  day: number,
  month: number,
  year: number,
): string | null {
  if (month < 1 || month > 12) return "Mes debe ser entre 1 y 12";
  if (year < MIN_BIRTH_YEAR || year > CURRENT_YEAR) {
    return `Año debe ser entre ${MIN_BIRTH_YEAR} y ${CURRENT_YEAR}`;
  }
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    return `Día debe ser entre 1 y ${maxDay} para ese mes`;
  }
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  birth.setHours(0, 0, 0, 0);
  if (birth > today) return "La fecha de nacimiento no puede ser futura";
  return null;
}

export interface IdentificationFormProps {
  formData: Pick<
    EncontradoFormData,
    | "nombre"
    | "apellido_p"
    | "apellido_m"
    | "sexo"
    | "fecha_n"
    | "estado_c"
    | "telefono"
  >;
  errors: Partial<Record<keyof EncontradoFormData, string>>;
  fechaInputs: FechaInputs;
  fechaError: string | null;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onFechaInputsChange: (partial: Partial<FechaInputs>) => void;
  onFechaNChange: (fechaN: string) => void;
  onFechaError: (error: string | null) => void;
  onClearFechaError: () => void;
  fechaMesRef: React.RefObject<HTMLInputElement>;
  fechaAnoRef: React.RefObject<HTMLInputElement>;
  className?: string;
}

/**
 * Sección del formulario: Identificación (nombre, apellidos, fecha de nacimiento, estado civil, teléfono).
 */
export function IdentificationForm({
  formData,
  errors,
  fechaInputs,
  fechaError,
  onChange,
  onFechaInputsChange,
  onFechaNChange,
  onFechaError,
  onClearFechaError,
  fechaMesRef,
  fechaAnoRef,
  className,
}: IdentificationFormProps) {
  const sexo = formData.sexo === "M" ? "M" : "H";
  const inputClass = getInputClass(sexo);

  const applyFechaInputs = useCallback(
    (dia: string, mes: string, ano: string) => {
      const d = dia === "" ? 0 : Number(dia);
      const m = mes === "" ? 0 : Number(mes);
      const y = ano === "" ? 0 : Number(ano);
      if (!d || !m || !y) {
        onFechaNChange("");
        onFechaError(null);
        return;
      }
      const error = validateFechaNacimiento(d, m, y);
      onFechaError(error);
      if (error) {
        onFechaNChange("");
        return;
      }
      onFechaNChange(buildFechaN(d, m, y));
      onClearFechaError();
    },
    [onFechaNChange, onFechaError, onClearFechaError],
  );

  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${className ?? ""}`.trim()}
    >
      <h2
        className={`mb-5 border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300 ${sexo === "H" ? "border-app-primary" : "border-pink-600"}`}
      >
        Identificación
      </h2>
      <div className="mb-4 grid gap-4 sm:grid-cols-1">
        <div>
          <label htmlFor="nombre" className={labelClass}>
            Nombre *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={onChange}
            className={`${inputClass} ${errors.nombre ? inputError : ""}`}
            placeholder="Nombre(s)"
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.nombre}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="apellido_p" className={labelClass}>
            Apellido paterno *
          </label>
          <input
            id="apellido_p"
            name="apellido_p"
            type="text"
            value={formData.apellido_p}
            onChange={onChange}
            className={`${inputClass} ${errors.apellido_p ? inputError : ""}`}
            placeholder="Apellido paterno"
          />
          {errors.apellido_p && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.apellido_p}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="apellido_m" className={labelClass}>
            Apellido materno
          </label>
          <input
            id="apellido_m"
            name="apellido_m"
            type="text"
            value={formData.apellido_m}
            onChange={onChange}
            className={inputClass}
            placeholder="Apellido materno"
          />
        </div>
        <div className="w-full sm:col-span-2">
          <fieldset className="flex w-full flex-row flex-nowrap items-end gap-3">
            <legend className={`${labelClass} shrink-0 pb-0`}>
              Fecha de nacimiento (DD/MM/AAAA)
            </legend>
            <div className="flex min-w-0 flex-1 flex-row flex-nowrap items-center gap-2">
              <input
                id="fecha_dia"
                type="text"
                inputMode="numeric"
                minLength={1}
                maxLength={2}
                placeholder="Día"
                value={fechaInputs.dia}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  onFechaInputsChange({ dia: v });
                  applyFechaInputs(v, fechaInputs.mes, fechaInputs.ano);
                  if (v.length === 2) fechaMesRef.current?.focus();
                }}
                className={`${inputClass} min-w-0 flex-1 text-center tabular-nums`}
                aria-label="Día"
              />
              <span className="shrink-0 text-app-text-secondary dark:text-gray-500">
                /
              </span>
              <input
                ref={fechaMesRef}
                id="fecha_mes"
                type="text"
                inputMode="numeric"
                minLength={1}
                maxLength={2}
                placeholder="Mes"
                value={fechaInputs.mes}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  onFechaInputsChange({ mes: v });
                  applyFechaInputs(fechaInputs.dia, v, fechaInputs.ano);
                  if (v.length === 2) fechaAnoRef.current?.focus();
                }}
                className={`${inputClass} min-w-0 flex-1 text-center tabular-nums`}
                aria-label="Mes"
              />
              <span className="shrink-0 text-app-text-secondary dark:text-gray-500">
                /
              </span>
              <input
                ref={fechaAnoRef}
                id="fecha_ano"
                type="text"
                inputMode="numeric"
                minLength={4}
                maxLength={4}
                placeholder="Año"
                value={fechaInputs.ano}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  onFechaInputsChange({ ano: v });
                  applyFechaInputs(fechaInputs.dia, fechaInputs.mes, v);
                }}
                className={`${inputClass} min-w-0 flex-1 text-center tabular-nums`}
                aria-label="Año"
              />
            </div>
            {formData.fecha_n && getAgeFromFechaN(formData.fecha_n) != null && (
              <span className="shrink-0 text-sm font-medium text-app-text-secondary dark:text-gray-400">
                Edad: {getAgeFromFechaN(formData.fecha_n)} años
              </span>
            )}
          </fieldset>
          {(fechaError || errors.fecha_n) && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.fecha_n ?? fechaError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="estado_c" className={labelClass}>
            Estado civil
          </label>
          <select
            id="estado_c"
            name="estado_c"
            value={formData.estado_c}
            onChange={onChange}
            className={inputClass}
            aria-label="Estado civil"
          >
            <option value="">Seleccionar</option>
            <option value="Soltero(a)">Soltero(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viudo(a)">Viudo(a)</option>
            <option value="Unión libre">Unión libre</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.estado_c && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.estado_c}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={formData.telefono}
            onChange={onChange}
            className={inputClass}
            placeholder="Teléfono fijo"
          />
        </div>
      </div>
    </section>
  );
}
