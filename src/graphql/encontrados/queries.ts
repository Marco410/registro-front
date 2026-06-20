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

export type EncontradoFieldSearchCondition =
  | { nombre?: { contains?: string; mode?: string } }
  | { apellido_p?: { contains?: string; mode?: string } }
  | { apellido_m?: { contains?: string; mode?: string } }
  | { clave?: { equals?: number } };

export interface EncontradosQueryVariables {
  where: {
    user?: { id?: { equals?: string } };
    sexo?: { equals?: string };
    /** Solo encontrados con al menos un check-in. */
    checkins?: { id?: { not?: null } };
    OR?: EncontradoFieldSearchCondition[];
    AND?: Array<
      | { OR: EncontradoFieldSearchCondition[] }
      | EncontradoFieldSearchCondition
    >;
  };
  take?: number;
  skip?: number;
}

function nameFieldOr(token: string): EncontradoFieldSearchCondition[] {
  return [
    { nombre: { contains: token, mode: "insensitive" } },
    { apellido_p: { contains: token, mode: "insensitive" } },
    { apellido_m: { contains: token, mode: "insensitive" } },
  ];
}

/**
 * Construye OR/AND para búsqueda por nombre, apellidos o clave (H1, M42).
 * Varias palabras exigen que cada token coincida en al menos un campo de nombre.
 */
export function buildEncontradoSearchWhere(
  searchNorm: string
): Pick<EncontradosQueryVariables["where"], "OR" | "AND"> | null {
  const trimmed = searchNorm.trim();
  if (!trimmed) return null;

  const firstUpper = trimmed[0]?.toUpperCase() ?? "";
  const afterSexo =
    firstUpper === "H" || firstUpper === "M"
      ? trimmed.slice(1).trim()
      : trimmed;
  const searchNum = afterSexo ? parseInt(afterSexo, 10) : NaN;
  const isClavePattern =
    !Number.isNaN(searchNum) && /^\d+$/.test(afterSexo) && !trimmed.includes(" ");

  if (isClavePattern) {
    return {
      OR: [...nameFieldOr(trimmed), { clave: { equals: searchNum } }],
    };
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  if (tokens.length === 1) {
    const token = tokens[0];
    const orConditions = nameFieldOr(token);
    const num = parseInt(token, 10);
    if (!Number.isNaN(num) && /^\d+$/.test(token)) {
      orConditions.push({ clave: { equals: num } });
    }
    return { OR: orConditions };
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
      estado_c
    }
  }
`;

export interface EncontradosEstadoCQueryVariables {
  /** Ej. { checkins_some: {} } en Keystone; o { checkins: { some: {} } } en Prisma. */
  where: Record<string, unknown>;
}

export interface EncontradosEstadoCQueryResponse {
  encontrados: { estado_c: string }[];
}

/**
 * Query para religión de encontrados (mismo where que estado civil).
 */
export const ENCONTRADOS_RELIGION_QUERY = gql`
  query EncontradosReligion($where: EncontradoWhereInput!) {
    encontrados(where: $where) {
      religion
    }
  }
`;

export interface EncontradosReligionQueryResponse {
  encontrados: { religion: string | null }[];
}
