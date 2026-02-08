import { User } from "registro/types";
import { createApolloClient } from "./apollo";
import { AUTHENTICATED_ITEM_QUERY } from "registro/graphql/auth/queries";
import { AuthenticatedItemResponse } from "registro/types";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const client = createApolloClient();

    const { data } = await client.query<AuthenticatedItemResponse>({
      query: AUTHENTICATED_ITEM_QUERY,
      fetchPolicy: "network-only",
    });

    if (data?.authenticatedItem) {
      return mapAuthenticatedUserToUser(data.authenticatedItem);
    }

    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Response interface for authentication operations
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Storage helpers
export const tokenStorage = {
  /**
   * Retrieves the stored authentication token
   *
   * @returns The stored token or null if not found or in server environment
   */
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  /**
   * Stores an authentication token in localStorage
   *
   * @param token - The authentication token to store
   */
  set(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },

  /**
   * Removes the authentication token from localStorage
   */
  remove(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },
};
