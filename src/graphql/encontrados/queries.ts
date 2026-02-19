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
  update_at: string;
  celular: boolean;
  medicamento: boolean;
  user?: { id: string; name?: string | null } | null;
  checkins?: { id: string; checkinAt: string } | null;
}

export interface EncontradosQueryVariables {
  where: {
    user?: { id?: { equals?: string } };
    sexo?: { equals?: string };
    OR?: Array<
      | { nombre?: { contains?: string; mode?: string } }
      | { apellido_p?: { contains?: string; mode?: string } }
      | { apellido_m?: { contains?: string; mode?: string } }
    >;
  };
  take?: number;
  skip?: number;
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
