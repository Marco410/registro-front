"use client";

import type { ChangeEvent } from "react";

export interface SexoSelectorProps {
  value: "H" | "M";
  error?: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Selector de sexo a registrar (Hombre / Mujer) para el formulario de encontrado.
 */
export function SexoSelector({
  value,
  error,
  onChange,
  className,
  label = "Sexo a registrar",
  disabled = false,
}: SexoSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`.trim()}>
      <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
        {label}
      </span>
      <div
        className={`inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 ${disabled ? "pointer-events-none opacity-60" : ""}`}
        role="radiogroup"
        aria-label="Sexo a registrar"
      >
        <label
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${!disabled && "cursor-pointer"} ${
            value === "H"
              ? "bg-white text-app-primary shadow-sm dark:bg-gray-700 dark:text-app-primary-muted"
              : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="sexo"
            value="H"
            checked={value === "H"}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />
          Hombre
        </label>
        <label
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${!disabled && "cursor-pointer"} ${
            value === "M"
              ? "bg-white text-rose-600 shadow-sm dark:bg-gray-700 dark:text-rose-400"
              : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="sexo"
            value="M"
            checked={value === "M"}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />
          Mujer
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
