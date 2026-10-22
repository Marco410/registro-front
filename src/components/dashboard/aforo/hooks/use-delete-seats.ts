"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  DELETE_SEATS_MUTATION,
  type DeleteSeatsResponse,
  type DeleteSeatsVariables,
} from "registro/graphql/aforo/mutations";
import { SEATS_QUERY } from "registro/graphql/aforo/queries";

/**
 * Hook para eliminar uno o varios asientos por id (deleteSeats).
 * Quien lo usa debe filtrar antes con `isSeatRemovable`: el backend no impide
 * borrar asientos ocupados. Refresca SEATS_QUERY y muestra los toasts.
 * `deleteSeats` devuelve `true` si se eliminaron.
 */
export function useDeleteSeats() {
  const [mutate, { loading }] = useMutation<
    DeleteSeatsResponse,
    DeleteSeatsVariables
  >(DELETE_SEATS_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
    awaitRefetchQueries: true,
  });

  const deleteSeats = async (seatIds: string[]): Promise<boolean> => {
    if (seatIds.length === 0) return false;
    try {
      await mutate({ variables: { where: seatIds.map((id) => ({ id })) } });
      toast.success(
        seatIds.length === 1
          ? "Asiento eliminado"
          : `${seatIds.length} asientos eliminados`,
      );
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar los asientos",
      );
      return false;
    }
  };

  return { deleteSeats, loading };
}
