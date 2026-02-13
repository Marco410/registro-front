"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { toast } from "sonner";
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
} from "registro/graphql/auth/mutations";
import {
  clearSessionToken,
  getAuthenticatedUser,
  setSessionToken,
} from "registro/lib/auth";
import { logger } from "registro/lib/logger";
import type { User } from "registro/types/user";
import type { LoginResponse } from "registro/types/user";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";

export interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = useApolloClient();
  const mountedRef = useRef(true);

  const [loginMutation, { loading: loginLoading }] = useMutation<LoginResponse>(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        const result = data?.authenticateUserWithPassword;
        if (result && "sessionToken" in result && result.sessionToken) {
          setSessionToken(result.sessionToken);
          setUser(mapAuthenticatedUserToUser(result.item));
        } else if (result && "message" in result) {
          logger.error("Authentication failed", {
            message: result.message,
          });
        }
      },
      onError: (error) => {
        logger.error("Login error", { error: error.message });
      },
    },
  );

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      clearSessionToken();
      setUser(null);
    },
    onError: () => {
      clearSessionToken();
      setUser(null);
    },
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      setIsLoading(false);
    }, 5000);

    const initAuth = async () => {
      try {
        const userData = await getAuthenticatedUser(client);
        if (!cancelled) setUser(userData);
      } catch (error) {
        logger.error("Failed to initialize authentication", { error });
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          clearTimeout(timeout);
          setIsLoading(false);
        }
      }
    };
    initAuth();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [client]);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResponse> => {
      try {
        const result = await loginMutation({
          variables: { username: username, password },
        });
        const data = result.data?.authenticateUserWithPassword;

        if (data && "sessionToken" in data) {
          const { sessionToken, item } = data;
          if (sessionToken) setSessionToken(sessionToken);
          setUser(mapAuthenticatedUserToUser(item));
          toast.success("Sesión iniciada");
          return { success: true };
        }
        if (data && "message" in data) {
          return { success: false, message: data.message };
        }
        return {
          success: false,
          message: "Error desconocido al iniciar sesión",
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al iniciar sesión";
        logger.error("Login error", { error });
        return { success: false, message };
      }
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
      toast.success("Sesión cerrada");
    } catch {
      clearSessionToken();
      setUser(null);
    }
  }, [logoutMutation]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await getAuthenticatedUser(client);
      if (mountedRef.current) setUser(userData);
    } catch (error) {
      logger.error("Failed to refresh user", { error });
      if (mountedRef.current) setUser(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [client]);

  const value: AuthContextValue = {
    user,
    isLoading: isLoading || loginLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
