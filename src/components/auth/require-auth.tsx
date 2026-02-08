"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "registro/hooks/use-auth";

const LOGIN_PATH = "/auth/login";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Ruta a la que redirigir si no hay sesión. Por defecto /auth/login */
  loginPath?: string;
}

/**
 * Protege rutas que requieren sesión. Redirige a login si no hay usuario.
 * Muestra estado de carga mientras se restaura la sesión.
 */
export function RequireAuth({
  children,
  loginPath = LOGIN_PATH,
}: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const url = `${loginPath}?redirect=${encodeURIComponent(pathname ?? "/dashboard")}`;
      router.replace(url);
    }
  }, [user, isLoading, loginPath, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 dark:bg-blue-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
