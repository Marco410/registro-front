"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  UPDATE_ENCONTRADO_MUTATION,
} from "registro/components/dashboard/registro/mutations";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";

export interface UseUpdateEncontradoOptions {
  onSuccess?: () => void;
}

function toUpdateData(data: EncontradoFormData) {
  return {
    nombre: data.nombre,
    apellido_p: data.apellido_p || undefined,
    apellido_m: data.apellido_m || undefined,
    sexo: data.sexo || undefined,
    fecha_n: data.fecha_n || undefined,
    estado_c: data.estado_c || undefined,
    telefono: data.telefono || undefined,
    nom_ref: data.nom_ref || undefined,
    tel_ref: data.tel_ref || undefined,
    enfermedad: data.enfermedad || undefined,
    user: data.user_id
      ? { connect: { id: data.user_id } }
      : undefined,
  };
}

/**
 * Hook con la lógica de actualización de encontrado: mutación, mapeo de datos y toasts.
 * Refresca la lista Encontrados al completar.
 */
export function useUpdateEncontrado(options: UseUpdateEncontradoOptions = {}) {
  const { onSuccess } = options;

  const [updateEncontrado, { loading }] = useMutation(
    UPDATE_ENCONTRADO_MUTATION,
    {
      refetchQueries: ["Encontrados"],
      onCompleted: () => {
        toast.success("Registro actualizado correctamente");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al actualizar");
      },
    },
  );

  const submitUpdate = async (
    encontradoId: string,
    data: EncontradoFormData,
  ) => {
    await updateEncontrado({
      variables: {
        where: { id: encontradoId },
        data: toUpdateData(data),
      },
    });
  };

  return { submitUpdate, loading };
}
