/**
 * Estilos compartidos para inputs y labels del formulario de registro.
 * El focus depende del sexo a registrar (H = azul, M = rosa).
 */

export const inputBase =
  "w-full px-3.5 py-2.5 rounded-xl border bg-white text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors dark:bg-[#202124] dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500";

export const labelClass =
  "block text-sm font-medium text-app-text-primary dark:text-gray-300 mb-1.5";

const inputBorderBySexo = {
  H: "border-gray-200 focus:border-app-primary focus:ring-app-primary/30 dark:focus:ring-app-primary-muted/30",
  M: "border-gray-200 focus:border-pink-500 focus:ring-pink-500/30 dark:focus:border-pink-400 dark:focus:ring-pink-400/30",
} as const;

export function getInputClass(sexo: "H" | "M"): string {
  return `${inputBase} ${inputBorderBySexo[sexo]}`;
}

const formSectionGlassBySexo = {
  H: "border border-app-primary/25 bg-app-primary/[0.03] shadow-md shadow-app-primary/10 backdrop-blur-md dark:border-app-primary-muted/35 dark:bg-app-primary/[0.14] dark:shadow-app-primary/20",
  M: "border border-pink-400/25 bg-pink-500/[0.03] shadow-md shadow-pink-500/10 backdrop-blur-md dark:border-pink-400/35 dark:bg-pink-500/[0.14] dark:shadow-pink-500/20",
} as const;

/** Contenedor de sección del formulario con fondo glass según sexo (H = azul, M = rosa). */
export function getFormSectionClass(sexo: "H" | "M", className?: string): string {
  return `rounded-2xl p-6 ${formSectionGlassBySexo[sexo]} ${className ?? ""}`.trim();
}

const glassCardBySexo = {
  H: {
    base: "border border-app-primary/25 bg-app-primary/[0.06] text-app-primary shadow-md shadow-app-primary/10 backdrop-blur-md dark:border-app-primary-muted/35 dark:bg-app-primary/[0.14] dark:text-app-primary-muted dark:shadow-app-primary/20",
    selected:
      "border-app-primary/45 bg-app-primary/[0.14] ring-1 ring-app-primary/20 dark:border-app-primary-muted/55 dark:bg-app-primary/[0.22] dark:ring-app-primary-muted/25",
    hover:
      "hover:border-app-primary/40 hover:bg-app-primary/[0.1] hover:shadow-lg hover:shadow-app-primary/15 dark:hover:bg-app-primary/[0.18]",
  },
  M: {
    base: "border border-pink-400/25 bg-pink-500/[0.06] text-pink-600 shadow-md shadow-pink-500/10 backdrop-blur-md dark:border-pink-400/35 dark:bg-pink-500/[0.14] dark:text-pink-400 dark:shadow-pink-500/20",
    selected:
      "border-pink-400/45 bg-pink-500/[0.14] ring-1 ring-pink-400/20 dark:border-pink-400/55 dark:bg-pink-500/[0.22] dark:ring-pink-400/25",
    hover:
      "hover:border-pink-400/40 hover:bg-pink-500/[0.1] hover:shadow-lg hover:shadow-pink-500/15 dark:hover:bg-pink-500/[0.18]",
  },
} as const;

export interface GlassCardClassOptions {
  selected?: boolean;
  interactive?: boolean;
  /** Badge inline compacto (no ocupa todo el ancho). */
  compact?: boolean;
  className?: string;
}

/** Tarjeta compacta con glassmorphism según sexo (listas, badges, etc.). */
export function getGlassCardClass(
  sexo: "H" | "M",
  options?: GlassCardClassOptions,
): string {
  const {
    selected = false,
    interactive = false,
    compact = false,
    className,
  } = options ?? {};
  const styles = glassCardBySexo[sexo];

  return [
    compact
      ? "w-fit max-w-full rounded-xl px-3 py-2"
      : "rounded-xl px-4 py-3",
    styles.base,
    selected ? styles.selected : "",
    interactive
      ? `cursor-pointer transform-gpu transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] ${styles.hover}`
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const inputError =
  "border-red-400 focus:ring-red-300 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500/30";
