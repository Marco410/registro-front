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
        nombre
        apellido_p
        apellido_m
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
    nombre: string;
    apellido_p: string;
    apellido_m: string;
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
