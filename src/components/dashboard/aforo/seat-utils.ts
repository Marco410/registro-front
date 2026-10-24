import type { Seat, SeatsAgeGroup } from "registro/graphql/aforo/queries";

/**
 * Cada cuánto se vuelven a consultar asientos y conteos del aforo, para que la
 * pantalla refleje lo que se registra en las demás estaciones sin recargar.
 */
export const AFORO_POLL_MS = 60_000;

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

/**
 * Texto pequeño por sexo; blue-700 / pink-700 para pasar 4.5:1 sobre fondos grises.
 * `chip`: borde y fondo suaves para que un botón se vea tocable (en móvil).
 */
export const SEX_STYLES: Record<
  "H" | "M",
  { label: string; text: string; hover: string; chip: string }
> = {
  H: {
    label: "Hombres",
    text: "text-blue-700 dark:text-app-primary-muted",
    hover: "hover:bg-app-primary/10 dark:hover:bg-app-primary-muted/15",
    chip: "border-blue-200 bg-blue-50 dark:border-app-primary-muted/30 dark:bg-app-primary-muted/10",
  },
  M: {
    label: "Mujeres",
    text: "text-pink-700 dark:text-pink-400",
    hover: "hover:bg-pink-500/10 dark:hover:bg-pink-500/15",
    chip: "border-pink-200 bg-pink-50 dark:border-pink-400/30 dark:bg-pink-500/10",
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
 * Dado de baja y todavía vacío (se pinta gris). Al dar de baja, el asiento queda con
 * `abandoned: true`; si después lo ocupa alguien más, `abandoned` sigue en true, pero el
 * asiento cuenta como ocupado: "ocupado" siempre gana.
 */
export function esBajaVacia(seat: Seat): boolean {
  return Boolean(seat.abandoned) && !seat.occupied;
}

/** Ocupado por alguien nuevo después de que otro lo dejó (punto gris). */
export function ocupadoTrasBaja(seat: Seat): boolean {
  return Boolean(seat.occupied) && Boolean(seat.abandonedBy);
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

/**
 * Reglas del desborde del check-in. Deben coincidir con
 * `registro-back/utils/constants/constants.ts` (`OVERFLOW_AGE_GROUP_LABEL`,
 * `REFUGIOS_AGE_GROUP_LABEL`, `OVERFLOW_GROUPS_PER_SIDE`).
 */
const OVERFLOW_AGE_GROUP_LABEL = "Cualquier edad";
const REFUGIOS_AGE_GROUP_LABEL = "Refugios";
const OVERFLOW_GROUPS_PER_SIDE = 2;

/**
 * Qué tan lejos de su rango de edad está sentado un encontrado: "cercano" si su equipo es de
 * uno de los grupos que el check-in revisa primero (2 arriba y 2 abajo), "lejano" si está más lejos.
 */
export type RangoEdad = "cercano" | "lejano";

/**
 * Colores de la raya de rango. Va fuera del asiento, sobre el fondo de la tarjeta: sobre el
 * azul o el rosa del asiento ocupado el rojo casi no contrasta. Naranja claro y rojo oscuro
 * para que también se distingan por brillo (daltonismo).
 */
export const RANGO_EDAD_BAR_CLASS: Record<RangoEdad, string> = {
  cercano: "bg-orange-500 dark:bg-orange-400",
  lejano: "bg-red-700 dark:bg-red-500",
};

/**
 * Arma la función que calcula el `RangoEdad` de un asiento, con la misma búsqueda que
 * `findOverflowTeam` en el backend. Compara el grupo que le tocó al encontrado en el check-in
 * con el grupo del equipo donde está sentado.
 * @returns null si el asiento está libre, si está en su grupo, en "Cualquier edad" o si falta información
 */
export function buildRangoEdad(
  ageGroups: SeatsAgeGroup[],
): (seat: Seat) => RangoEdad | null {
  const byId = new Map(ageGroups.map((g) => [g.id, g]));
  const candidatos = ageGroups
    .filter(
      (g) =>
        !g.label.includes(OVERFLOW_AGE_GROUP_LABEL) &&
        !g.label.includes(REFUGIOS_AGE_GROUP_LABEL),
    )
    .sort((a, b) => a.minAge - b.minAge);
  const cercanosPorGrupo = new Map<string, Set<string>>();

  const cercanos = (grupo: SeatsAgeGroup): Set<string> => {
    let ids = cercanosPorGrupo.get(grupo.id);
    if (!ids) {
      const arriba = candidatos.filter((g) => g.minAge > grupo.minAge);
      const abajo = candidatos.filter((g) => g.minAge < grupo.minAge).reverse();
      ids = new Set(
        [
          ...arriba.slice(0, OVERFLOW_GROUPS_PER_SIDE),
          ...abajo.slice(0, OVERFLOW_GROUPS_PER_SIDE),
        ].map((g) => g.id),
      );
      cercanosPorGrupo.set(grupo.id, ids);
    }
    return ids;
  };

  return (seat) => {
    const grupoPersona = byId.get(seat.encontrado?.checkins?.ageGroup?.id ?? "");
    const grupoEquipo = seat.team?.ageGroup;
    if (!seat.occupied || !grupoPersona || !grupoEquipo?.id) return null;
    if (grupoEquipo.id === grupoPersona.id) return null;
    if (grupoEquipo.label.includes(OVERFLOW_AGE_GROUP_LABEL)) return null;
    return cercanos(grupoPersona).has(grupoEquipo.id) ? "cercano" : "lejano";
  };
}
