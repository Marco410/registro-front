import type { Seat } from "registro/graphql/aforo/queries";

/**
 * Letras válidas para un asiento. Se limita a A–Z porque el backend ordena y
 * asigna asientos por `letter` como texto: "AA" quedaría entre "A" y "B".
 */
export const SEAT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

/** "A–O", "A" o "" según las letras (ya ordenadas) de una fila. */
export function formatLetterRange(seats: Seat[]): string {
  if (seats.length === 0) return "";
  const first = seats[0].letter;
  const last = seats[seats.length - 1].letter;
  return first === last ? first : `${first}–${last}`;
}
