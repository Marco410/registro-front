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
    nombre: data.nombre.trim(),
    apellido_p: data.apellido_p.trim() || undefined,
    apellido_m: data.apellido_m?.trim() || undefined,
    sexo: data.sexo || undefined,
    fecha_n: data.fecha_n || undefined,
    estado_c: data.estado_c || undefined,
    religion: data.religion || undefined,
    telefono: data.telefono || undefined,
    address: data.address?.trim() || undefined,
    nom_ref: data.nom_ref || undefined,
    tel_ref: data.tel_ref || undefined,
    enfermedad: data.enfermedad || undefined,
    celular: data.celular,
    medicamento: data.medicamento,
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
      refetchQueries: ["Encontrados"],
      onCompleted: (data) => {
        toast.success("Encontrado registrado correctamente");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al registrar");
      },
    },
  );

  const submitEncontrado = async (
    data: EncontradoFormData,
  ): Promise<{ id: string } | null> => {
    const result = await createEncontrado({
      variables: { data: toMutationData(data) },
    });
    return result.data?.createEncontradoTransactional ?? null;
  };

  return { submitEncontrado, loading };
}
