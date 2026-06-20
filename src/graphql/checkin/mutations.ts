import { gql } from "@apollo/client";

/**
 * Mutación custom para realizar el check-in de un encontrado.
 * Backend: performCheckin(encontradoId: ID!, userId: ID!, responsejson: JSON): CheckinResult
 */
export const PERFORM_CHECKIN_MUTATION = gql`
  mutation PerformCheckin(
    $encontradoId: ID!
    $userId: ID!
    $responsejson: JSON
  ) {
    performCheckin(
      encontradoId: $encontradoId
      userId: $userId
      responsejson: $responsejson
    ) {
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
          apellido_p
          apellido_m
          sexo
          celular
          medicamento
          edad
          estado_c
          religion
          telefono
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
      encontrado: {
        id: string;
        nombre: string;
        apellido_p: string;
        apellido_m: string;
        sexo: string;
        celular: boolean;
        medicamento: boolean;
        edad: number | null;
        estado_c: string | null;
        religion: string | null;
        telefono: string | null;
      };
      seat: { id: string; letter: string };
      team: { id: string; teamNumber: number; teamName: string };
    } | null;
  };
}

export interface PerformCheckinVariables {
  encontradoId: string;
  userId: string;
  responsejson?: Record<string, unknown> | null;
}

/** Elimina el check-in de un encontrado. */
export const REMOVE_CHECKIN_MUTATION = gql`
  mutation RemoveCheckin($encontradoId: ID!) {
    removeCheckin(encontradoId: $encontradoId) {
      success
    }
  }
`;

export interface RemoveCheckinResponse {
  removeCheckin: {
    success: boolean;
  };
}

export interface RemoveCheckinVariables {
  encontradoId: string;
}
