"use client";

import { useMutation } from "@apollo/client";
import { PERFORM_PRINT_GAFETE_MUTATION, PrintGafeteResponse, PrintGafeteVariables } from "registro/graphql/printGafete/mutations";
import { toast } from "sonner";

export interface UsePrintGafeteOptions {
  onSuccess?: (data: PrintGafeteResponse["makePrintGafete"]) => void;
  onError?: (error: Error) => void;
}

export function usePrintGafete(options: UsePrintGafeteOptions = {}) {
  const { onSuccess, onError } = options;

  const [PrintGafete, { loading }] = useMutation<
    PrintGafeteResponse,
    PrintGafeteVariables
  >(PERFORM_PRINT_GAFETE_MUTATION, {
    refetchQueries: ["Checkins"],
    onCompleted: (data) => {
      const result = data.makePrintGafete;
      if (result.success) {
        toast.info("Impresión existosa");
      } else {
        toast.error("No se pudo imprimir");
      }
      onSuccess?.(result);
    },
    onError: (err) => {
      if (!onError) toast.error(err.message ?? "Error al imprimir");
      onError?.(err);
    },
  });

  const submit = async (
    nombre: string,
    clave: string,
    copies: number,
  ) => {
    await PrintGafete({
      variables: {
        nombre,
        clave,
        copies
      },
    });
  };

  return { PrintGafete: submit, loading };
}
