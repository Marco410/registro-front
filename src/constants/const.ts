export const TAB_CHECKIN = "checkin";
export const TAB_REGISTRO = "registro";

export const DASHBOARD = "/dashboard";

/** Clave de localStorage para el sexo seleccionado (compartida entre Check-in y Registro). */
export const REGISTRO_SEXO_KEY = "registro_sexo";

/**
 * Lee el sexo guardado en localStorage. Usar como valor inicial en Check-in y Registro
 * para que ambos muestren el mismo valor al cambiar de tab.
 */
export function getStoredSexo(): "H" | "M" {
  if (typeof window === "undefined" || !window.localStorage) return "H";
  return window.localStorage.getItem(REGISTRO_SEXO_KEY) === "M" ? "M" : "H";
}