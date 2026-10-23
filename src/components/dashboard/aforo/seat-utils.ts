import type { Seat } from "registro/graphql/aforo/queries";

/**
 * Letras válidas para un asiento. Se limita a A–Z porque el backend ordena y
 * asigna asientos por `letter` como texto: "AA" quedaría entre "A" y "B".
 */
export const SEAT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Columnas de la vista de salón (xl+): hombres | pasillo con el equipo | mujeres.
 * La comparten el encabezado, cada fila y el esqueleto para que todo quede alineado.
 * Si cambia el ancho del pasillo (10rem), hay que ajustar `--seat-size` en SeatsShell.
 */
export const TEAM_ROW_GRID = "xl:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)]";

/**
 * Tamaño de un asiento: 1.75rem; en xl+ toma `--seat-size` del contenedor (SeatsGrid).
 * Lo usan el asiento real (SeatBox) y su hueso en el esqueleto, para que midan igual.
 */
export const SEAT_SIZE_CLASS =
  "h-7 w-7 xl:h-[var(--seat-size,1.75rem)] xl:w-[var(--seat-size,1.75rem)]";

/** Texto pequeño por sexo; blue-700 / pink-700 para pasar 4.5:1 sobre fondos grises. */
export const SEX_STYLES: Record<
  "H" | "M",
  { label: string; text: string; hover: string }
> = {
  H: {
    label: "Hombres",
    text: "text-blue-700 dark:text-app-primary-muted",
    hover: "hover:bg-app-primary/10 dark:hover:bg-app-primary-muted/15",
  },
  M: {
    label: "Mujeres",
    text: "text-pink-700 dark:text-pink-400",
    hover: "hover:bg-pink-500/10 dark:hover:bg-pink-500/15",
  },
};

/** Sexo del asiento (H/M); usa el del encontrado si el asiento no lo tiene. */
export function getSeatSex(seat: Seat): "H" | "M" {
  const sex = seat.gender || seat.encontrado?.sexo || "";
  return sex === "M" ? "M" : "H";
}

/** Ordena asientos por letra, igual que `SEATS_QUERY` (`orderBy: { letter: asc }`). */
export function sortSeatsByLetter(seats: Seat[]): Seat[] {
  return [...seats].sort((a, b) => a.letter.localeCompare(b.letter));
}

/**
 * Un asiento se puede eliminar solo si nunca guardó información: libre, sin
 * encontrado y sin baja registrada (las bajas cuentan en las estadísticas).
 */
export function isSeatRemovable(seat: Seat): boolean {
  return (
    !seat.occupied && !seat.encontrado && !seat.abandoned && !seat.abandonedBy
  );
}

/**
 * Letras que todavía puede usar un equipo, en orden alfabético. La primera es
 * la que sigue. Rellena primero los huecos (si se borró la C, sigue la C) para
 * que la fila quede continua.
 */
export function getFreeSeatLetters(usedLetters: string[]): string[] {
  const used = new Set(usedLetters.map((l) => l.trim().toUpperCase()));
  return SEAT_ALPHABET.filter((l) => !used.has(l));
}

/**
 * Asientos que se pueden quitar desde el final de la fila (Z → A).
 * Se detiene en el primer asiento ocupado o con baja para no dejar huecos ni
 * borrar historial; ese asiento se devuelve en `blockedBy`.
 */
export function getTrailingRemovableSeats(seats: Seat[]): {
  seats: Seat[];
  blockedBy: Seat | null;
} {
  const result: Seat[] = [];
  for (const seat of sortSeatsByLetter(seats).reverse()) {
    if (!isSeatRemovable(seat)) return { seats: result, blockedBy: seat };
    result.push(seat);
  }
  return { seats: result, blockedBy: null };
}

/** Conteo de una fila de asientos. `libres` no incluye los dados de baja. */
export function countSeats(seats: Seat[]): {
  total: number;
  ocupados: number;
  libres: number;
} {
  let ocupados = 0;
  let libres = 0;
  for (const seat of seats) {
    if (seat.occupied) ocupados += 1;
    else if (!seat.abandoned) libres += 1;
  }
  return { total: seats.length, ocupados, libres };
}

/** "A–O", "A" o "" según las letras (ya ordenadas) de una fila. */
export function formatLetterRange(seats: Seat[]): string {
  if (seats.length === 0) return "";
  const first = seats[0].letter;
  const last = seats[seats.length - 1].letter;
  return first === last ? first : `${first}–${last}`;
}
