"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  DELETE_EMPTY_TEAM_MUTATION,
  REORDER_TEAMS_MUTATION,
  type DeleteEmptyTeamVariables,
  type ReorderTeamsVariables,
} from "registro/graphql/aforo/mutations";
import {
  EQUIPOS_GESTION_QUERY,
  SEATS_QUERY,
  TEAMS_QUERY,
} from "registro/graphql/aforo/queries";
import {
  GENERATE_TEAMS_MUTATION,
  type GenerateTeamsResponse,
  type GenerateTeamsVariables,
} from "registro/graphql/mantenimiento/mutations";

/** Lo que cambia al tocar equipos: el modal, la cuadrícula del aforo y la lista de equipos. */
const REFETCH = [EQUIPOS_GESTION_QUERY, SEATS_QUERY, TEAMS_QUERY];

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Hooks de "Gestionar equipos" (solo admin): reordenar desde el altar, eliminar un equipo
 * vacío y agregar uno al final (vía generateTeams con 1 equipo). Cada acción refresca el
 * modal y el aforo, muestra su toast y devuelve `true` si salió bien.
 */
export function useManageTeams() {
  const [reorderMutate, { loading: reordering }] = useMutation<
    unknown,
    ReorderTeamsVariables
  >(REORDER_TEAMS_MUTATION, { refetchQueries: REFETCH, awaitRefetchQueries: true });

  const [deleteMutate, { loading: deleting }] = useMutation<
    unknown,
    DeleteEmptyTeamVariables
  >(DELETE_EMPTY_TEAM_MUTATION, {
    refetchQueries: REFETCH,
    awaitRefetchQueries: true,
  });

  const [addMutate, { loading: adding }] = useMutation<
    GenerateTeamsResponse,
    GenerateTeamsVariables
  >(GENERATE_TEAMS_MUTATION, { refetchQueries: REFETCH, awaitRefetchQueries: true });

  const reorderTeams = async (teamIds: string[]): Promise<boolean> => {
    try {
      await reorderMutate({ variables: { teamIds } });
      toast.success("Orden de equipos guardado");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "No se pudo guardar el orden"));
      return false;
    }
  };

  const deleteTeam = async (teamId: string, teamName: string): Promise<boolean> => {
    try {
      await deleteMutate({ variables: { teamId } });
      toast.success(`${teamName} eliminado`);
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "No se pudo eliminar el equipo"));
      return false;
    }
  };

  const addTeam = async (input: {
    ageGroupId: string;
    seatsHombres: number;
    seatsMujeres: number;
  }): Promise<boolean> => {
    try {
      await addMutate({
        variables: {
          input: {
            groups: [{ ageGroupId: input.ageGroupId, count: 1 }],
            seatsHombres: input.seatsHombres,
            seatsMujeres: input.seatsMujeres,
          },
        },
      });
      toast.success("Equipo agregado al final");
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "No se pudo agregar el equipo"));
      return false;
    }
  };

  return {
    reorderTeams,
    deleteTeam,
    addTeam,
    busy: reordering || deleting || adding,
    reordering,
    deleting,
    adding,
  };
}
