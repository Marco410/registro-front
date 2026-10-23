"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  REVOKE_USER_SESSIONS_MUTATION,
  type RevokeUserSessionsResponse,
  type RevokeUserSessionsVariables,
} from "registro/graphql/users/mutations";

/**
 * Hook para cerrar las sesiones de un usuario (revokeUserSessions, solo admin).
 * Muestra los toasts y devuelve true si se cerraron.
 */
export function useRevokeUserSessions() {
  const [mutate, { loading }] = useMutation<
    RevokeUserSessionsResponse,
    RevokeUserSessionsVariables
  >(REVOKE_USER_SESSIONS_MUTATION);

  const revokeUserSessions = async (
    userId: string,
    userLabel: string,
  ): Promise<boolean> => {
    try {
      const { data } = await mutate({ variables: { userId } });
      if (!data?.revokeUserSessions) return false;
      toast.success(
        `Se cerró la sesión de ${userLabel}. Tendrá que volver a iniciar sesión.`,
      );
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo cerrar la sesión",
      );
      return false;
    }
  };

  return { revokeUserSessions, loading };
}
