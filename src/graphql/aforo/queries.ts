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
      encontrado {
        nombre
        apellido_p
        apellido_m
        sexo
      }
      team {
        teamName
        teamNumber
        ageGroup {
          label
        }
      }
    }
  }
`;

export interface SeatEncontrado {
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  sexo: string;
}

export interface SeatTeam {
  teamName: string;
  teamNumber: number;
  ageGroup: { label: string };
}

export interface Seat {
  id: string;
  letter: string;
  occupied: boolean;
  gender: string;
  assignedAt: string | null;
  encontrado: SeatEncontrado | null;
  team: SeatTeam | null;
}

export interface SeatsQueryResponse {
  seats: Seat[];
}

export const AFORO_QUERY = gql`
  query DashboardCounts {
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
}
