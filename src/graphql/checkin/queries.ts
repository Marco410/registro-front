import { gql } from "@apollo/client";

/**
 * Query para listar check-ins realizados por un usuario.
 */
export const CHECKINS_QUERY = gql`
  query Checkins($where: CheckinWhereInput!) {
    checkins(where: $where, orderBy: { checkinAt: desc }) {
      id
      checkinAt
      ageGroup {
        label
      }
      user {
        id
        name
      }
      encontrado {
        id
        nombre
        apellido_p
        apellido_m
        edad
        estado_c
        religion
        telefono
        sexo
        celular
        medicamento
        user {
          id
          name
        }
      }
      clave
      seat {
        id
        letter
      }
      team {
        id
        teamName
        teamNumber
      }
      user {
        id
        name
      }
    }
  }
`;

export interface CheckinListItem {
  id: string;
  checkinAt: string;
  ageGroup?: { label: string } | null;
  encontrado: {
    id: string;
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    edad?: number | null;
    estado_c: string;
    religion?: string | null;
    telefono?: string | null;
    sexo: string;
    celular: boolean;
    medicamento: boolean;
    user?: { id: string; name?: string | null } | null;
  };
  clave: string;
  seat?: { id: string; letter: string } | null;
  team?: { id: string; teamNumber: number; teamName: string } | null;
  user?: { id: string; name?: string | null } | null;
}

export interface CheckinsQueryVariables {
  where: {
    user?: { id?: { equals?: string } };
  };
}

export interface CheckinsQueryResponse {
  checkins: CheckinListItem[];
}

/**
 * Equipos con asientos libres de un sexo, en orden desde el altar. Se usa para elegir
 * asiento a mano cuando el check-in no encontró lugar automático (error `SIN_LUGAR`).
 */
export const ASIENTOS_LIBRES_QUERY = gql`
  query AsientosLibres($sexo: String!) {
    teams(
      where: {
        seats: {
          some: { occupied: { equals: false }, gender: { equals: $sexo } }
        }
      }
      orderBy: [{ order: asc }, { teamNumber: asc }]
    ) {
      id
      teamNumber
      teamName
      ageGroup {
        label
      }
      seats(
        where: { occupied: { equals: false }, gender: { equals: $sexo } }
        orderBy: { letter: asc }
      ) {
        id
        letter
      }
    }
  }
`;

export interface EquipoConAsientosLibres {
  id: string;
  teamNumber: number;
  teamName: string;
  ageGroup: { label: string } | null;
  seats: { id: string; letter: string }[];
}

export interface AsientosLibresResponse {
  teams: EquipoConAsientosLibres[];
}

export interface AsientosLibresVariables {
  sexo: "H" | "M";
}
