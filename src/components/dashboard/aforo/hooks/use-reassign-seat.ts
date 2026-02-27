"use client";

import { gql, useMutation } from "@apollo/client";
import { SEATS_QUERY } from "registro/graphql/aforo/queries";

export const PERFORM_REASSIGN_SEAT_MUTATION = gql`
  mutation Mutation(
    $encontradoId: ID!
    $currentSeatId: ID!
    $newSeatId: ID!
  ) {
    performReassignSeat(
      encontradoId: $encontradoId
      currentSeatId: $currentSeatId
      newSeatId: $newSeatId
    ) {
      success
    }
  }
`;

export interface PerformReassignSeatVariables {
  encontradoId: string;
  currentSeatId: string;
  newSeatId: string;
}

export interface PerformReassignSeatResponse {
  performReassignSeat: { success: boolean };
}

/**
 * Hook para ejecutar la mutación performReassignSeat (mover un encontrado de un asiento a otro).
 * Refresca la lista de asientos al terminar.
 */
export function useReassignSeat() {
  const [mutate, result] = useMutation<
    PerformReassignSeatResponse,
    PerformReassignSeatVariables
  >(PERFORM_REASSIGN_SEAT_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
  });

  const performReassign = async (params: {
    encontradoId: string;
    currentSeatId: string;
    newSeatId: string;
  }) => {
    return mutate({
      variables: {
        encontradoId: params.encontradoId,
        currentSeatId: params.currentSeatId,
        newSeatId: params.newSeatId,
      },
    });
  };

  return { performReassign, loading: result.loading, error: result.error };
}
