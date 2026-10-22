/**
 * Helpers de formato de fechas en español.
 */

/** Fecha y hora corta: "22 oct 2026, 03:15 p. m.". Devuelve el texto original si no es fecha. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function localDayToIso(day: string, endOfDay: boolean): string | undefined {
  if (!DAY_PATTERN.test(day)) return undefined;
  const [y, m, d] = day.split("-").map(Number);
  const date = endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d, 0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Convierte un rango de días (YYYY-MM-DD, como lo da un input type="date") a ISO para filtrar
 * timestamps: `desde` al inicio del día y `hasta` al final, en la zona horaria del navegador.
 * Un extremo vacío o inválido queda sin definir.
 */
export function dayRangeToIso(
  desde: string,
  hasta: string,
): { gte?: string; lte?: string } {
  return {
    gte: localDayToIso(desde, false),
    lte: localDayToIso(hasta, true),
  };
}
