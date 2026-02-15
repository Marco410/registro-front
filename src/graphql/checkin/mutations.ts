import { gql } from "@apollo/client";

/**
 * Mutación custom para realizar el check-in de un encontrado.
 * Backend: performCheckin(encontradoId: ID!, responsejson: JSON): CheckinResult
 */
export const PERFORM_CHECKIN_MUTATION = gql`
  mutation PerformCheckin($encontradoId: ID!, $responsejson: JSON) {
    performCheckin(encontradoId: $encontradoId, responsejson: $responsejson) {
      alreadyCheckedIn
      unassignedGroup
      overflow
      checkin {
        id
        checkinAt
        ageGroup {
          id
          label
        }
        encontrado {
          id
          nombre
          sexo
        }
        seat {
          id
          letter
        }
        team {
          id
          teamNumber
          teamName
        }
      }
    }
  }
`;

export interface PerformCheckinResponse {
  performCheckin: {
    alreadyCheckedIn: boolean | null;
    unassignedGroup: boolean;
    overflow: boolean;
    checkin: {
      id: string;
      checkinAt: string;
      ageGroup: { id: string; label: string };
      encontrado: { id: string; nombre: string; sexo: string };
      seat: { id: string; letter: string };
      team: { id: string; teamNumber: number; teamName: string };
    } | null;
  };
}

export interface PerformCheckinVariables {
  encontradoId: string;
  responsejson?: Record<string, unknown> | null;
}
