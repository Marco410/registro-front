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
      sexo
      tel_ref
      telefono
      update_at
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
  fecha_n: string;
  nom_ref?: string | null;
  sexo: string;
  tel_ref?: string | null;
  telefono?: string | null;
  update_at: string;
  user?: { id: string; name?: string | null } | null;
  checkins?:
    | { id: string; checkinAt: string }
    | Array<{ id: string; checkinAt: string }>
    | null;
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
      fecha_n
      nom_ref
      sexo
      tel_ref
      telefono
      update_at
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
