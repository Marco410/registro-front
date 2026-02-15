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
}

export function usePerformCheckin(options: UsePerformCheckinOptions = {}) {
  const { onSuccess } = options;

  const [performCheckin, { loading }] = useMutation<
    PerformCheckinResponse,
    PerformCheckinVariables
  >(PERFORM_CHECKIN_MUTATION, {
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
      toast.error(err.message ?? "Error al hacer check-in");
    },
  });

  const submit = async (
    encontradoId: string,
    responsejson?: Record<string, unknown> | null,
  ) => {
    await performCheckin({
      variables: { encontradoId, responsejson: responsejson ?? null },
    });
  };

  return { performCheckin: submit, loading };
}
