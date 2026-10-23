/**
 * Escala de texto de todo el sistema. Se aplica como `--font-scale` en <html>, y
 * globals.css la multiplica por el font-size raíz, así que todo lo que está en rem
 * (texto, espacios, anchos de Tailwind) crece o se achica junto. La preferencia es
 * de cada equipo de cómputo (localStorage), no del usuario.
 */
export const FONT_SCALE_STORAGE_KEY = "registro-font-scale";
export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.05;
export const FONT_SCALE_DEFAULT = 1;

/** Limita la escala al rango permitido; un valor inválido vuelve al 100%. */
export function clampFontScale(value: number): number {
  if (Number.isNaN(value)) return FONT_SCALE_DEFAULT;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));
}

/** Lee la escala guardada; sin localStorage (modo privado, bloqueado) devuelve 100%. */
export function readStoredFontScale(): number {
  try {
    const raw = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    return raw ? clampFontScale(parseFloat(raw)) : FONT_SCALE_DEFAULT;
  } catch {
    return FONT_SCALE_DEFAULT;
  }
}

/** Aplica la escala en <html> y la guarda para la próxima visita. */
export function persistFontScale(scale: number): void {
  const next = clampFontScale(scale);
  document.documentElement.style.setProperty("--font-scale", String(next));
  try {
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(next));
  } catch {
    /* sin almacenamiento: la escala dura solo esta pestaña */
  }
}

/**
 * Script para el <head>: aplica la escala guardada antes del primer pintado, así la
 * página no aparece al 100% y luego salta al tamaño elegido.
 */
export const FONT_SCALE_INIT_SCRIPT = `(function(){try{var n=parseFloat(localStorage.getItem(${JSON.stringify(
  FONT_SCALE_STORAGE_KEY,
)})||"");if(isNaN(n))return;n=Math.min(${FONT_SCALE_MAX},Math.max(${FONT_SCALE_MIN},n));document.documentElement.style.setProperty("--font-scale",String(n));}catch(e){}})();`;
