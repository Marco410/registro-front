"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { CREATE_ENCONTRADO_MUTATION } from "registro/components/dashboard/registro/mutations";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";

export interface UseCreateEncontradoOptions {
  onSuccess?: () => void;
}

function toMutationData(data: EncontradoFormData) {
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
    user: {
      connect: {
        id: data.user_id,
      },
    },
  };
}

/**
 * Hook con la lógica de creación de encontrado: mutación, mapeo de datos y toasts.
 */
export function useCreateEncontrado(options: UseCreateEncontradoOptions = {}) {
  const { onSuccess } = options;

  const [createEncontrado, { loading }] = useMutation(
    CREATE_ENCONTRADO_MUTATION,
    {
      onCompleted: () => {
        toast.success("Encontrado registrado correctamente");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al registrar");
      },
    },
  );

  const submitEncontrado = async (data: EncontradoFormData) => {
    await createEncontrado({
      variables: { data: toMutationData(data) },
    });
  };

  return { submitEncontrado, loading };
}
