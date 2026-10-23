"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  CLEAN_DATABASE_MUTATION,
  type CleanDatabaseOptions,
  type CleanDatabaseResponse,
  type CleanDatabaseResult,
  type CleanDatabaseVariables,
} from "registro/graphql/mantenimiento/mutations";

/** "120 check-ins, 3 equipos…" con lo que realmente se borró. */
function resumen(r: CleanDatabaseResult): string {
  const partes = [
    r.checkins && `${r.checkins} check-ins`,
    r.seatsFreed && `${r.seatsFreed} asientos liberados`,
    r.encontrados && `${r.encontrados} encontrados`,
    r.teams && `${r.teams} equipos (${r.seats} asientos)`,
    r.bautizosForaneos && `${r.bautizosForaneos} bautizos foráneos`,
    r.bautizosQuitados && `${r.bautizosQuitados} marcas de bautizo`,
    r.auditLogs && `${r.auditLogs} entradas de bitácora`,
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(", ") : "No había nada que borrar";
}

/**
 * Hook para limpiar la base de datos (cleanDatabase). Al terminar vacía la caché de
 * Apollo y vuelve a pedir las consultas activas, para que ninguna pantalla muestre datos
 * que ya no existen. `cleanDatabase` devuelve `true` si terminó bien.
 */
export function useCleanDatabase() {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation<
    CleanDatabaseResponse,
    CleanDatabaseVariables
  >(CLEAN_DATABASE_MUTATION);

  const cleanDatabase = async (input: CleanDatabaseOptions): Promise<boolean> => {
    try {
      const { data } = await mutate({ variables: { input } });
      const result = data?.cleanDatabase;
      if (!result) return false;
      await client.resetStore();
      toast.success(`Base limpiada: ${resumen(result)}`);
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo limpiar la base de datos",
      );
      return false;
    }
  };

  return { cleanDatabase, loading };
}
