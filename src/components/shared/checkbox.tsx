"use client";

import type { InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** "H" = azul, "M" = rosa */
  sexo?: "H" | "M";
  label: string;
}

const accentBySexo = {
  H: "accent-app-primary",
  M: "accent-pink-500",
} as const;

/**
 * Checkbox reutilizable con color por sexo (azul/rosa).
 */
export function Checkbox({
  sexo = "H",
  label,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const safeId = id ?? `checkbox-${label.replace(/\s/g, "-")}`;
  return (
    <label
      htmlFor={safeId}
      className={`flex cursor-pointer items-center gap-2.5 text-sm font-medium text-app-text-primary dark:text-gray-300 ${className}`.trim()}
    >
      <input
        type="checkbox"
        id={safeId}
        className={`h-4 w-4 rounded border-gray-300 transition-colors ${accentBySexo[sexo]} dark:border-gray-600`}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
