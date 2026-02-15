"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { UPDATE_ENCONTRADO_MUTATION } from "registro/components/dashboard/registro/mutations";

export interface UpdateCheckinOptionsInput {
  encontradoId: string;
  celular: boolean;
  medicamento: boolean;
}

export interface UseUpdateCheckinOptionsHookOptions {
  onSuccess?: () => void;
}

/**
 * Actualiza solo celular y medicamento del encontrado (para flujo de check-in).
 */
export function useUpdateCheckinOptions(
  options: UseUpdateCheckinOptionsHookOptions = {},
) {
  const { onSuccess } = options;

  const [updateEncontrado, { loading }] = useMutation(
    UPDATE_ENCONTRADO_MUTATION,
    {
      refetchQueries: ["Encontrados"],
      onCompleted: () => {
        toast.success("Opciones guardadas");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al guardar");
      },
    },
  );

  const submit = async ({
    encontradoId,
    celular,
    medicamento,
  }: UpdateCheckinOptionsInput) => {
    await updateEncontrado({
      variables: {
        where: { id: encontradoId },
        data: { celular, medicamento },
      },
    });
  };

  return { updateCheckinOptions: submit, loading };
}
