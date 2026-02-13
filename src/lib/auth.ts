import type { ApolloClient } from "@apollo/client";
import { AUTHENTICATED_ITEM_QUERY } from "registro/graphql/auth/queries";
import type { AuthenticatedItemResponse } from "registro/types/user";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";
import type { User } from "registro/types/user";

export const SESSION_TOKEN_KEY = "keystonejs-session-token";
const SESSION_COOKIE_NAME = "keystonejs-session";
const SESSION_DAYS = 30;

/**
 * Guarda el token de sesión en localStorage y en cookie para que las peticiones
 * subsiguientes (Apollo con Bearer / backend con cookie) reconozcan la sesión.
 */
export function setSessionToken(sessionToken: string): void {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(SESSION_TOKEN_KEY, sessionToken);
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

/**
 * Elimina el token de sesión de localStorage y de la cookie.
 */
export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage?.removeItem(SESSION_TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Obtiene el usuario actual de la sesión (cookie/token) vía GraphQL.
 * Retorna el usuario mapeado o null si no hay sesión.
 */
export async function getAuthenticatedUser(
  client: ApolloClient<unknown>,
): Promise<User | null> {
  const { data } = await client.query<AuthenticatedItemResponse>({
    query: AUTHENTICATED_ITEM_QUERY,
    fetchPolicy: "network-only",
  });
  const item = data?.authenticatedItem ?? null;
  if (!item || !("id" in item)) return null;
  return mapAuthenticatedUserToUser(item);
}
