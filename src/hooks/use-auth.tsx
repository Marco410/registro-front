"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LoginResponse, User } from "registro/types";
import { LOGIN_MUTATION, LOGOUT_MUTATION } from "registro/graphql/auth/queries";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";
import { AuthResponse, getAuthenticatedUser } from "./auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication context provider component
 *
 * Manages global authentication state including user data, loading states,
 * and authentication actions. Automatically restores authentication state
 * from stored tokens on app initialization.
 *
 * @param children - Child components that need access to authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation<LoginResponse>(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        if (
          data?.authenticateUserWithPassword &&
          "sessionToken" in data.authenticateUserWithPassword
        ) {
          const { item } = data.authenticateUserWithPassword;
          setUser(mapAuthenticatedUserToUser(item));
        } else if (
          data?.authenticateUserWithPassword &&
          "message" in data.authenticateUserWithPassword
        ) {
          console.error("Authentication failed", {
            message: data.authenticateUserWithPassword.message,
          });
        }
      },
      onError: (error) => {
        console.error("Login error", { error });
      },
    },
  );

  // Logout mutation
  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      setUser(null);
    },
    onError: () => {
      setUser(null);
    },
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await getAuthenticatedUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const result = await loginMutation({
        variables: { email, password },
      });

      if (
        result.data?.authenticateUserWithPassword &&
        "sessionToken" in result.data.authenticateUserWithPassword
      ) {
        return { success: true };
      } else if (
        result.data?.authenticateUserWithPassword &&
        "message" in result.data.authenticateUserWithPassword
      ) {
        return {
          success: false,
          message: result.data.authenticateUserWithPassword.message,
        };
      }

      return {
        success: false,
        message: "Error desconocido al iniciar sesión",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation();
  };

  const forgotPassword = async (): Promise<AuthResponse> => {
    // TODO: Implement forgot password mutation
    return {
      success: true,
      message: "Instrucciones enviadas a tu correo",
    };
  };

  const refreshUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await getAuthenticatedUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginLoading,
        isAuthenticated: !!user,
        login,
        logout,
        forgotPassword,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 *
 * Provides access to the current user, authentication state, and authentication actions.
 * Must be used within an AuthProvider component tree.
 *
 * @returns Authentication context object with user data and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { login, isLoading, isAuthenticated } = useAuth();
 *
 *   if (isAuthenticated) {
 *     return <DashboardButton />;
 *   }
 *
 *   return (
 *     <button onClick={() => login(email, password)} disabled={isLoading}>
 *       {isLoading ? 'Logging in...' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
