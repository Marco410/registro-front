"use client";

import { ApolloError, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  PERFORM_CHECKIN_MUTATION,
  type PerformCheckinResponse,
  type PerformCheckinVariables,
} from "registro/graphql/checkin/mutations";
import { CHECKINS_QUERY } from "registro/graphql/checkin/queries";
import { SEATS_QUERY } from "registro/graphql/aforo/queries";

/** Código con el que el backend avisa que no encontró lugar automático. */
const SIN_LUGAR_ERROR_CODE = "SIN_LUGAR";

/** Indica si el error del check-in es "ya no hay equipos con lugar" (hay que elegir asiento). */
function isSinLugarError(error: Error): boolean {
  return (
    error instanceof ApolloError &&
    error.graphQLErrors.some(
      (e) => e.extensions?.code === SIN_LUGAR_ERROR_CODE,
    )
  );
}

export interface UsePerformCheckinOptions {
  onSuccess?: (data: PerformCheckinResponse["performCheckin"]) => void;
  onError?: (error: Error) => void;
  /**
   * El backend no encontró lugar y no hizo el check-in: hay que pedirle al usuario que elija
   * un asiento y volver a llamar con `seatId`. Sin este callback se trata como error normal.
   */
  onSinLugar?: () => void;
}

/**
 * Hace el check-in de un encontrado con `performCheckin` y muestra los toasts.
 * Si no hay lugar automático y se pasó `onSinLugar`, avisa con un toast y llama ese callback
 * en lugar de `onError`.
 */
export function usePerformCheckin(options: UsePerformCheckinOptions = {}) {
  const { onSuccess, onError, onSinLugar } = options;

  const [performCheckin, { loading }] = useMutation<
    PerformCheckinResponse,
    PerformCheckinVariables
  >(PERFORM_CHECKIN_MUTATION, {
    // SEATS_QUERY solo se refresca si Aforo está abierto (consulta activa).
    refetchQueries: [CHECKINS_QUERY, SEATS_QUERY],
    onCompleted: (data) => {
      const result = data.performCheckin;
      if (result.alreadyCheckedIn && result.checkin) {
        toast.info("Ya tenía check-in registrado");
      } else {
        toast.success("Check-in realizado");
      }
      onSuccess?.(result);
    },
    onError: (err) => {
      if (onSinLugar && isSinLugarError(err)) {
        toast.warning(err.message);
        onSinLugar();
        return;
      }
      if (!onError) toast.error(err.message ?? "Error al hacer check-in");
      onError?.(err);
    },
  });

  /**
   * @param seatId Asiento que eligió el usuario cuando no hubo lugar automático
   * @returns true si se hizo (o ya existía) el check-in
   */
  const submit = async (
    encontradoId: string,
    userId: string,
    responsejson?: Record<string, unknown> | null,
    seatId?: string | null,
  ): Promise<boolean> => {
    const { data } = await performCheckin({
      variables: {
        encontradoId,
        userId,
        responsejson: responsejson ?? null,
        seatId: seatId ?? null,
      },
    });
    return Boolean(data?.performCheckin);
  };

  return { performCheckin: submit, loading };
}
