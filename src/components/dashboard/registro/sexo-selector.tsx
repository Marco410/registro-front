"use client";

import type { ChangeEvent } from "react";

export interface SexoSelectorProps {
  value: "M" | "F";
  error?: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  className?: string;
}

/**
 * Selector de sexo a registrar (Masculino / Femenino) para el formulario de encontrado.
 */
export function SexoSelector({
  value,
  error,
  onChange,
  className,
}: SexoSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
        Sexo a registrar
      </span>
      <div
        className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
        role="radiogroup"
        aria-label="Sexo a registrar"
      >
        <label
          className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            value === "M"
              ? "bg-white text-app-primary shadow-sm dark:bg-gray-700 dark:text-app-primary-muted"
              : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="sexo"
            value="M"
            checked={value === "M"}
            onChange={onChange}
            className="sr-only"
          />
          Masculino
        </label>
        <label
          className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            value === "F"
              ? "bg-white text-rose-600 shadow-sm dark:bg-gray-700 dark:text-rose-400"
              : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="sexo"
            value="F"
            checked={value === "F"}
            onChange={onChange}
            className="sr-only"
          />
          Femenino
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
