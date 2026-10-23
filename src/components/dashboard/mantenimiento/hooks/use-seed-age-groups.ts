"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  SEED_AGE_GROUPS_MUTATION,
  type SeedAgeGroupsResponse,
} from "registro/graphql/mantenimiento/mutations";
import { MANTENIMIENTO_QUERY } from "registro/graphql/mantenimiento/queries";

/**
 * Hook para crear los roles y grupos de edad del seed que falten (seedAgeGroups).
 * Refresca la página y muestra los toasts.
 */
export function useSeedAgeGroups() {
  const [mutate, { loading }] = useMutation<SeedAgeGroupsResponse>(
    SEED_AGE_GROUPS_MUTATION,
    { refetchQueries: [MANTENIMIENTO_QUERY], awaitRefetchQueries: true },
  );

  const seedAgeGroups = async (): Promise<boolean> => {
    try {
      const { data } = await mutate();
      const created = data?.seedAgeGroups?.ageGroupsCreated ?? 0;
      toast.success(
        created > 0
          ? `Se crearon ${created} grupos de edad`
          : "Los grupos de edad del seed ya existían",
      );
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudieron crear los grupos de edad",
      );
      return false;
    }
  };

  return { seedAgeGroups, loading };
}
