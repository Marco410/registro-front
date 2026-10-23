import type { ApolloClient } from "@apollo/client";
import { AUTHENTICATED_ITEM_QUERY } from "registro/graphql/auth/queries";
import type { AuthenticatedItemResponse } from "registro/types/user";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";
import type { User } from "registro/types/user";

export const SESSION_TOKEN_KEY = "keystonejs-session-token";
/** Último usuario confirmado por el servidor; permite abrir el sistema sin esperar la red. */
const SESSION_USER_KEY = "registro-session-user";
const SESSION_COOKIE_NAME = "keystonejs-session";
/** Igual que el backend (auth/auth.ts): la sesión solo termina si un admin la cierra. */
const SESSION_DAYS = 365;

/**
 * Evento de ventana para pedir que se verifique la sesión con el servidor (p. ej. tras un
 * "No autorizado"). Lo escucha AuthProvider.
 */
export const SESSION_CHECK_EVENT = "registro:session-check";

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
 * Elimina el token de sesión y el usuario guardado de localStorage y de la cookie.
 */
export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.removeItem(SESSION_TOKEN_KEY);
    window.localStorage?.removeItem(SESSION_USER_KEY);
  } catch {
    /* sin almacenamiento: no hay nada que borrar */
  }
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/** true si hay un token de sesión guardado en este navegador. */
export function hasSessionToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage?.getItem(SESSION_TOKEN_KEY));
  } catch {
    return false;
  }
}

/** Guarda el usuario confirmado por el servidor para la próxima vez que se abra el sistema. */
export function storeSessionUser(user: User): void {
  try {
    window.localStorage?.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch {
    /* sin almacenamiento: al recargar se esperará al servidor */
  }
}

/**
 * Usuario guardado, solo si también hay token (sin token no hay sesión que retomar).
 * Devuelve null si no hay o si está dañado.
 */
export function readSessionUser(): User | null {
  if (!hasSessionToken()) return null;
  try {
    const raw = window.localStorage?.getItem(SESSION_USER_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

/**
 * Indica si el usuario tiene el rol `admin`.
 */
export function isAdmin(user: User | null | undefined): boolean {
  return Boolean(user?.roles?.some((role) => role.name === "admin"));
}

/**
 * Obtiene el usuario actual de la sesión (cookie/token) vía GraphQL.
 * Retorna el usuario mapeado, o null si el servidor respondió que no hay sesión (token
 * vencido, inválido o cerrado por un admin). Si no se pudo hablar con el servidor, lanza:
 * eso no significa que la sesión haya terminado.
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
