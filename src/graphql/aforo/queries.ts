import { gql } from "@apollo/client";

/**
 * Query para listar todos los asientos con asignación y equipo.
 */
export const SEATS_QUERY = gql`
  query Seats {
    seats(orderBy: { letter: asc }) {
      id
      letter
      occupied
      gender
      assignedAt
      abandoned
      abandonedBy {
        nombre
        apellido_p
        apellido_m
        sexo
      }
      encontrado {
        id
        nombre
        apellido_p
        apellido_m
        sexo
        celular
        medicamento
        bautizo
      }
      team {
        id
        teamName
        teamNumber
        order
        captain
        auxiliar1
        auxiliar2
        auxiliar3
        ageGroup {
          label
        }
      }
    }
  }
`;

export interface SeatEncontrado {
  id: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  sexo: string;
  celular: boolean;
  medicamento: boolean;
  bautizo: boolean;
}

export interface SeatTeam {
  id: string;
  teamName: string;
  teamNumber: number;
  order?: number | null;
  captain?: string | null;
  auxiliar1?: string | null;
  auxiliar2?: string | null;
  auxiliar3?: string | null;
  ageGroup: { label: string };
}

export interface SeatAbandonedBy {
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  sexo: string;
}

export interface Seat {
  id: string;
  letter: string;
  occupied: boolean;
  gender: string;
  assignedAt: string | null;
  abandoned: boolean;
  abandonedBy: SeatAbandonedBy | null;
  encontrado: SeatEncontrado | null;
  team: SeatTeam | null;
}

export interface SeatsQueryResponse {
  seats: Seat[];
}

export const AFORO_QUERY = gql`
  query DashboardCounts {
    encontradosCount
    encontradosCountH: encontradosCount(where: { sexo: { equals: "H" } })
    encontradosCountM: encontradosCount(where: { sexo: { equals: "M" } })
    checkinsCount
    checkinsCountH: checkinsCount(
      where: { encontrado: { sexo: { equals: "H" } } }
    )
    checkinsCountM: checkinsCount(
      where: { encontrado: { sexo: { equals: "M" } } }
    )
  }
`;

export interface AforoResponse {
  checkinsCount: number;
  checkinsCountH: number;
  checkinsCountM: number;
  encontradosCount: number;
  encontradosCountH: number;
  encontradosCountM: number;
}
