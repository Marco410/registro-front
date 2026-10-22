"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  UPDATE_TEAM_RESPONSABLES_MUTATION,
  type UpdateTeamResponsablesVariables,
} from "registro/graphql/aforo/mutations";

/**
 * Hook para guardar capitán y auxiliares de un equipo (updateTeam).
 * El resultado se normaliza en la caché como `Team:<id>`, así que SEATS_QUERY
 * se actualiza sin refetch. Muestra los toasts de éxito o error.
 * `updateResponsables` devuelve `true` si se guardó.
 */
export function useUpdateTeamResponsables() {
  const [mutate, { loading }] = useMutation<
    unknown,
    UpdateTeamResponsablesVariables
  >(UPDATE_TEAM_RESPONSABLES_MUTATION);

  const updateResponsables = async (
    teamId: string,
    data: UpdateTeamResponsablesVariables["data"],
  ): Promise<boolean> => {
    try {
      await mutate({ variables: { where: { id: teamId }, data } });
      toast.success("Responsables guardados");
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los responsables",
      );
      return false;
    }
  };

  return { updateResponsables, loading };
}
