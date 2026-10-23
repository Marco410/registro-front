"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  GENERATE_TEAMS_MUTATION,
  type GenerateTeamsResponse,
  type GenerateTeamsVariables,
} from "registro/graphql/mantenimiento/mutations";
import { MANTENIMIENTO_QUERY } from "registro/graphql/mantenimiento/queries";

/**
 * Hook para generar equipos y asientos en lote (generateTeams). Refresca los conteos de
 * la página y muestra los toasts. `generateTeams` devuelve `true` si se crearon.
 */
export function useGenerateTeams() {
  const [mutate, { loading }] = useMutation<
    GenerateTeamsResponse,
    GenerateTeamsVariables
  >(GENERATE_TEAMS_MUTATION, {
    refetchQueries: [MANTENIMIENTO_QUERY],
    awaitRefetchQueries: true,
  });

  const generateTeams = async (
    input: GenerateTeamsVariables["input"],
  ): Promise<boolean> => {
    try {
      const { data } = await mutate({ variables: { input } });
      const result = data?.generateTeams;
      if (!result) return false;
      toast.success(
        `Se crearon ${result.teamsCreated} equipos y ${result.seatsCreated} asientos`,
      );
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudieron generar los equipos",
      );
      return false;
    }
  };

  return { generateTeams, loading };
}
