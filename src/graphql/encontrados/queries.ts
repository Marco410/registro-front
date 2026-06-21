import { gql } from "@apollo/client";

/**
 * Query para listar encontrados filtrados por where (ej. por user.id).
 */
export const ENCONTRADOS_QUERY = gql`
  query Encontrados($where: EncontradoWhereInput!, $take: Int, $skip: Int) {
    encontrados(
      where: $where
      orderBy: [{ create_at: desc }]
      take: $take
      skip: $skip
    ) {
      id
      nombre
      apellido_p
      apellido_m
      clave
      create_at
      edad
      enfermedad
      estado_c
      fecha_n
      nom_ref
      religion
      sexo
      tel_ref
      telefono
      address
      update_at
      celular
      medicamento
      user {
        id
        name
      }
      checkins {
        id
        checkinAt
        seat {
          id
          letter
        }
        team {
          id
          teamName
          teamNumber
        }
      }
    }
    encontradosCount(where: $where)
  }
`;

export interface EncontradoListItem {
  id: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  clave: string;
  create_at: string;
  edad?: number | null;
  enfermedad?: string | null;
  estado_c: string;
  religion?: string | null;
  fecha_n: string;
  nom_ref?: string | null;
  sexo: string;
  tel_ref?: string | null;
  telefono?: string | null;
  address?: string | null;
  update_at: string;
  celular: boolean;
  medicamento: boolean;
  user?: { id: string; name?: string | null } | null;
  checkins?: {
    id: string;
    checkinAt: string;
    seat?: { id: string; letter: string } | null;
    team?: { id: string; teamName: string; teamNumber: number } | null;
  } | null;
}

export type EncontradoCheckinsWhere = {
  id?: { not?: null };
  team?: { teamNumber?: { equals?: number } };
  seat?: { letter?: { equals?: string } };
};

export type EncontradoFieldSearchCondition =
  | { nombre?: { contains?: string; mode?: string } }
  | { apellido_p?: { contains?: string; mode?: string } }
  | { apellido_m?: { contains?: string; mode?: string } }
  | { clave?: { equals?: number } }
  | { sexo?: { equals?: string } }
  | { checkins?: EncontradoCheckinsWhere }
  | { AND?: EncontradoFieldSearchCondition[] };

export interface EncontradosQueryVariables {
  where: {
    user?: { id?: { equals?: string } };
    sexo?: { equals?: string };
    checkins?: EncontradoCheckinsWhere;
    OR?: EncontradoFieldSearchCondition[];
    AND?: Array<
      | { OR: EncontradoFieldSearchCondition[] }
      | EncontradoFieldSearchCondition
    >;
  };
  take?: number;
  skip?: number;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

const ACCENT_VOWELS: Record<string, string> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ú",
};

/** Variantes con/sin acento para que "raul" coincida con "RAÚL" y viceversa. */
function getAccentSearchVariants(token: string): string[] {
  const variants = new Set<string>([token]);
  const base = stripAccents(token);
  variants.add(base);

  for (let i = 0; i < base.length; i++) {
    const lower = base[i].toLowerCase();
    const accent = ACCENT_VOWELS[lower];
    if (!accent) continue;
    const accented =
      base.slice(0, i) +
      (base[i] === base[i].toUpperCase()
        ? accent.toUpperCase()
        : accent) +
      base.slice(i + 1);
    variants.add(accented);
  }

  return [...variants];
}

function nameFieldOr(token: string): EncontradoFieldSearchCondition[] {
  const variants = getAccentSearchVariants(token);
  const conditions: EncontradoFieldSearchCondition[] = [];

  for (const variant of variants) {
    conditions.push(
      { nombre: { contains: variant, mode: "insensitive" } },
      { apellido_p: { contains: variant, mode: "insensitive" } },
      { apellido_m: { contains: variant, mode: "insensitive" } },
    );
  }

  return conditions;
}

type CheckinClaveMatch = {
  sexo: "H" | "M";
  teamNumber: number;
  letter?: string;
};

/** Ej: "h5a" → sexo H, equipo 5, asiento A (clave de check-in). */
function parseCheckinClavePattern(search: string): CheckinClaveMatch | null {
  const m = search.trim().match(/^([hm])(\d+)([a-z])?$/i);
  if (!m) return null;
  return {
    sexo: m[1].toUpperCase() as "H" | "M",
    teamNumber: parseInt(m[2], 10),
    letter: m[3]?.toUpperCase(),
  };
}

function checkinClaveWhere(
  match: CheckinClaveMatch
): EncontradoFieldSearchCondition {
  const checkins: EncontradoCheckinsWhere = {
    team: { teamNumber: { equals: match.teamNumber } },
  };
  if (match.letter) {
    checkins.seat = { letter: { equals: match.letter } };
  }
  return {
    AND: [{ sexo: { equals: match.sexo } }, { checkins }],
  };
}

/** Condiciones extra por ID (H197) o clave de check-in (H5A, M12). */
function idAndCheckinClaveOr(token: string): EncontradoFieldSearchCondition[] {
  const extra: EncontradoFieldSearchCondition[] = [];

  const firstUpper = token[0]?.toUpperCase() ?? "";
  const afterSexo =
    firstUpper === "H" || firstUpper === "M" ? token.slice(1).trim() : token;

  if (afterSexo && /^\d+$/.test(afterSexo)) {
    const searchNum = parseInt(afterSexo, 10);
    if (!Number.isNaN(searchNum)) {
      extra.push({ clave: { equals: searchNum } });
    }
  } else if (/^\d+$/.test(token)) {
    const num = parseInt(token, 10);
    if (!Number.isNaN(num)) {
      extra.push({ clave: { equals: num } });
    }
  }

  const checkinClave = parseCheckinClavePattern(token);
  if (checkinClave) {
    extra.push(checkinClaveWhere(checkinClave));
  }

  return extra;
}

/**
 * Construye OR/AND para búsqueda por nombre, apellidos, ID (H197) o clave de check-in (H5A).
 * Varias palabras exigen que cada token coincida en al menos un campo de nombre.
 */
export function buildEncontradoSearchWhere(
  searchNorm: string
): Pick<EncontradosQueryVariables["where"], "OR" | "AND"> | null {
  const trimmed = searchNorm.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  if (tokens.length === 1) {
    const token = tokens[0];
    return {
      OR: [...nameFieldOr(token), ...idAndCheckinClaveOr(token)],
    };
  }

  return {
    AND: tokens.map((token) => ({ OR: nameFieldOr(token) })),
  };
}

export interface EncontradosQueryResponse {
  encontrados: EncontradoListItem[];
  encontradosCount: number;
}

/**
 * Query para obtener un encontrado por id (edición).
 */
export const ENCONTRADO_BY_ID_QUERY = gql`
  query EncontradoById($where: EncontradoWhereUniqueInput!) {
    encontrado(where: $where) {
      id
      nombre
      apellido_p
      apellido_m
      clave
      create_at
      edad
      enfermedad
      estado_c
      religion
      fecha_n
      nom_ref
      sexo
      tel_ref
      telefono
      address
      celular
      medicamento
      update_at
      checkins {
        id
        checkinAt
      }
      user {
        id
        name
      }
    }
  }
`;

export interface EncontradoByIdQueryVariables {
  where: { id: string };
}

export interface EncontradoByIdQueryResponse {
  encontrado: EncontradoListItem | null;
}

/** Opciones de estado civil (igual que en IdentificationForm). */
export const ESTADO_C_OPTIONS = [
  "Soltero(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viudo(a)",
  "Unión libre",
  "Otro",
] as const;

/**
 * Query para estado civil de encontrados que tienen al menos un check-in.
 * Usar where: { checkins_some: {} } (Keystone) o donde aplique en tu API.
 */
export const ENCONTRADOS_ESTADO_C_QUERY = gql`
  query EncontradosEstadoC($where: EncontradoWhereInput!) {
    encontrados(where: $where) {
      id
      estado_c
    }
  }
`;

export interface EncontradosEstadoCQueryVariables {
  /** Ej. { checkins_some: {} } en Keystone; o { checkins: { some: {} } } en Prisma. */
  where: Record<string, unknown>;
}

export interface EncontradosEstadoCQueryResponse {
  encontrados: { id: string; estado_c: string }[];
}

/**
 * Query para religión de encontrados (mismo where que estado civil).
 */
export const ENCONTRADOS_RELIGION_QUERY = gql`
  query EncontradosReligion($where: EncontradoWhereInput!) {
    encontrados(where: $where) {
      id
      religion
    }
  }
`;

export interface EncontradosReligionQueryResponse {
  encontrados: { id: string; religion: string | null }[];
}
