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
  SESSION_CHECK_EVENT,
  clearSessionToken,
  getAuthenticatedUser,
  readSessionUser,
  setSessionToken,
  storeSessionUser,
} from "registro/lib/auth";
import { logger } from "registro/lib/logger";
import type { User } from "registro/types/user";
import type { LoginResponse } from "registro/types/user";
import { mapAuthenticatedUserToUser } from "registro/types/user-mapper";

export interface AuthResponse {
  success: boolean;
  message?: string;
}

/** Resultado de confirmar la sesión con el servidor. */
type SessionCheck = "activa" | "terminada" | "sin-conexion";

/** Cada cuánto se confirma con el servidor que la sesión sigue activa. */
const SESSION_CHECK_INTERVAL_MS = 60_000;
/** Esperas entre reintentos mientras el servidor no responde al abrir el sistema. */
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 30_000];

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** true si la última verificación no pudo hablar con el servidor; la sesión se conserva. */
  connectionError: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sesión del usuario. La sesión solo termina cuando el servidor responde que ya no es
 * válida (un admin la cerró desde Usuarios, o el usuario salió); un error de red o un
 * servidor lento nunca manda al login. Al abrir el sistema se usa el último usuario
 * confirmado (localStorage) y se verifica en segundo plano; después se vuelve a verificar
 * cada minuto, al regresar a la pestaña y cuando una petición responde "No autorizado".
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const client = useApolloClient();
  const userRef = useRef<User | null>(null);
  const checkingRef = useRef<Promise<SessionCheck> | null>(null);
  /** Cambia con cada login/logout para descartar verificaciones que empezaron antes. */
  const generationRef = useRef(0);

  const [loginMutation, { loading: loginLoading }] =
    useMutation<LoginResponse>(LOGIN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  /** Fija el usuario sin re-renderizar si los datos no cambiaron. */
  const applyUser = useCallback((next: User | null) => {
    userRef.current = next;
    setUser((prev) =>
      prev && next && JSON.stringify(prev) === JSON.stringify(next)
        ? prev
        : next,
    );
  }, []);

  const checkSession = useCallback((): Promise<SessionCheck> => {
    if (checkingRef.current) return checkingRef.current;
    const generation = generationRef.current;

    const run = (async (): Promise<SessionCheck> => {
      try {
        const current = await getAuthenticatedUser(client);
        if (generation !== generationRef.current) return "activa";
        setConnectionError(false);
        if (current) {
          storeSessionUser(current);
          applyUser(current);
          return "activa";
        }
        if (userRef.current) {
          toast.info("Tu sesión se cerró. Vuelve a iniciar sesión.");
        }
        clearSessionToken();
        applyUser(null);
        return "terminada";
      } catch (error) {
        if (generation !== generationRef.current) return "activa";
        // Esperable (red caída, servidor ocupado): la sesión se conserva y se reintenta.
        console.warn("[Auth] No se pudo verificar la sesión; se conserva.", error);
        setConnectionError(true);
        return "sin-conexion";
      } finally {
        checkingRef.current = null;
        setIsLoading(false);
      }
    })();

    checkingRef.current = run;
    return run;
  }, [client, applyUser]);

  // Al abrir: retoma el último usuario confirmado y verifica; si no hay conexión, reintenta.
  useEffect(() => {
    const stored = readSessionUser();
    if (stored) {
      applyUser(stored);
      setIsLoading(false);
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    const verify = async () => {
      const result = await checkSession();
      if (cancelled || result !== "sin-conexion") return;
      const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
      attempt += 1;
      timer = setTimeout(verify, delay);
    };
    void verify();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [applyUser, checkSession]);

  // Con sesión: verifica cada minuto, al volver a la pestaña o a la red, y cuando se pida.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    const check = () => void checkSession();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const interval = setInterval(check, SESSION_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", check);
    window.addEventListener(SESSION_CHECK_EVENT, check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", check);
      window.removeEventListener(SESSION_CHECK_EVENT, check);
    };
  }, [userId, checkSession]);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResponse> => {
      try {
        const result = await loginMutation({
          variables: { username: username, password },
        });
        const data = result.data?.authenticateUserWithPassword;

        if (data && "sessionToken" in data) {
          generationRef.current += 1;
          const loggedIn = mapAuthenticatedUserToUser(data.item);
          if (data.sessionToken) setSessionToken(data.sessionToken);
          storeSessionUser(loggedIn);
          applyUser(loggedIn);
          setConnectionError(false);
          toast.success("Sesión iniciada");
          return { success: true };
        }
        if (data && "message" in data) {
          logger.error("Authentication failed", { message: data.message });
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
    [loginMutation, applyUser],
  );

  const logout = useCallback(async () => {
    generationRef.current += 1;
    try {
      await logoutMutation();
      toast.success("Sesión cerrada");
    } catch {
      /* el token se borra igual: el usuario pidió salir */
    } finally {
      clearSessionToken();
      applyUser(null);
    }
  }, [logoutMutation, applyUser]);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value: AuthContextValue = {
    user,
    isLoading: isLoading || loginLoading,
    isAuthenticated: !!user,
    connectionError,
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
