"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  CREATE_SEATS_MUTATION,
  type CreateSeatInput,
  type CreateSeatsResponse,
  type CreateSeatsVariables,
} from "registro/graphql/aforo/mutations";
import { SEATS_QUERY } from "registro/graphql/aforo/queries";

/**
 * Hook para crear varios asientos en una sola petición (createSeats).
 * Refresca SEATS_QUERY y muestra los toasts de éxito o error.
 * `createSeats` devuelve `true` si se crearon.
 */
export function useCreateSeats() {
  const [mutate, { loading }] = useMutation<
    CreateSeatsResponse,
    CreateSeatsVariables
  >(CREATE_SEATS_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
    awaitRefetchQueries: true,
  });

  const createSeats = async (data: CreateSeatInput[]): Promise<boolean> => {
    if (data.length === 0) return false;
    try {
      await mutate({ variables: { data } });
      toast.success(
        data.length === 1 ? "Asiento creado" : `${data.length} asientos creados`,
      );
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear los asientos",
      );
      return false;
    }
  };

  return { createSeats, loading };
}
