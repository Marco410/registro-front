import { gql } from "@apollo/client";

/**
 * Query para listar encontrados filtrados por where (ej. por user.id).
 */
export const ENCONTRADOS_QUERY = gql`
  query Encontrados($where: EncontradoWhereInput!) {
    encontrados(where: $where, orderBy: [{ create_at: desc }]) {
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
}

export interface EncontradosQueryVariables {
  where: {
    user?: { id?: { equals?: string } };
  };
}

export interface EncontradosQueryResponse {
  encontrados: EncontradoListItem[];
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
