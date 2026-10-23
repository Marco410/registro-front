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
  /** Etiqueta en línea y botones más bajos, para encabezados de sección. */
  compact?: boolean;
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
  compact = false,
}: SexoSelectorProps) {
  const pillSize = compact ? "px-3 py-1.5" : "px-4 py-2.5";
  return (
    <div
      className={`flex ${compact ? "flex-row items-center gap-3" : "flex-col gap-2"} ${className ?? ""}`.trim()}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
        {label}
      </span>
      <div
        className={`inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 ${disabled ? "pointer-events-none opacity-60" : ""}`}
        role="radiogroup"
        aria-label="Sexo a registrar"
      >
        <label
          className={`rounded-lg ${pillSize} text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-app-primary/60 ${!disabled && "cursor-pointer"} ${
            value === "H"
              ? "bg-white text-app-primary shadow-sm ring-1 ring-app-primary/30 dark:bg-gray-700 dark:text-app-primary-muted dark:ring-app-primary-muted/40"
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
          className={`rounded-lg ${pillSize} text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-500/60 ${!disabled && "cursor-pointer"} ${
            value === "M"
              ? "bg-white text-rose-600 shadow-sm ring-1 ring-rose-500/30 dark:bg-gray-700 dark:text-rose-400 dark:ring-rose-400/40"
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
