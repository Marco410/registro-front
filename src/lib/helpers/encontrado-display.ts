/**
 * Helpers para mostrar datos del formulario de encontrado (valores, fechas, edad).
 * Compartidos entre el formulario de registro y el modal de confirmación.
 */

export function displayValue(value: string | boolean | undefined): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (value === undefined || value === null) return "N/A";
  const s = String(value).trim();
  return s === "" ? "N/A" : s;
}

export function formatFechaDisplay(fecha: string): string {
  if (!fecha || fecha.length < 10) return "N/A";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export function getAgeFromFechaN(fechaN: string): number | null {
  if (!fechaN || fechaN.length < 10) return null;
  const birth = new Date(fechaN);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age < 0 ? null : age;
}

export function displayEdad(fechaN: string): string {
  const age = getAgeFromFechaN(fechaN);
  return age != null ? `${age} años` : "N/A";
}
