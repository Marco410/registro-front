"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  PERFORM_CHECKIN_MUTATION,
  type PerformCheckinResponse,
  type PerformCheckinVariables,
} from "registro/graphql/checkin/mutations";

export interface UsePerformCheckinOptions {
  onSuccess?: (data: PerformCheckinResponse["performCheckin"]) => void;
  onError?: (error: Error) => void;
}

export function usePerformCheckin(options: UsePerformCheckinOptions = {}) {
  const { onSuccess, onError } = options;

  const [performCheckin, { loading }] = useMutation<
    PerformCheckinResponse,
    PerformCheckinVariables
  >(PERFORM_CHECKIN_MUTATION, {
    refetchQueries: ["Checkins"],
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
      if (!onError) toast.error(err.message ?? "Error al hacer check-in");
      onError?.(err);
    },
  });

  const submit = async (
    encontradoId: string,
    userId: string,
    responsejson?: Record<string, unknown> | null,
  ) => {
    await performCheckin({
      variables: {
        encontradoId,
        userId,
        responsejson: responsejson ?? null,
      },
    });
  };

  return { performCheckin: submit, loading };
}
