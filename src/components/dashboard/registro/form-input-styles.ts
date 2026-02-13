/**
 * Estilos compartidos para inputs y labels del formulario de registro.
 * El focus depende del sexo a registrar (M = azul, F = rosa).
 */

export const inputBase =
  "w-full px-3.5 py-2.5 rounded-xl border bg-white text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors dark:bg-[#202124] dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500";

export const labelClass =
  "block text-sm font-medium text-app-text-primary dark:text-gray-300 mb-1.5";

const inputBorderBySexo = {
  M: "border-gray-200 focus:border-app-primary focus:ring-app-primary/30 dark:focus:ring-app-primary-muted/30",
  F: "border-gray-200 focus:border-pink-500 focus:ring-pink-500/30 dark:focus:border-pink-400 dark:focus:ring-pink-400/30",
} as const;

export function getInputClass(sexo: "M" | "F"): string {
  return `${inputBase} ${inputBorderBySexo[sexo]}`;
}

export const inputError =
  "border-red-400 focus:ring-red-300 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500/30";
