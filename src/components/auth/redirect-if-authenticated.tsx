"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "registro/hooks/use-auth";

const DASHBOARD_PATH = "/dashboard";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  /** Ruta a la que redirigir si ya hay sesión. Por defecto /dashboard */
  redirectTo?: string;
}

/**
 * Envía al usuario al dashboard (o otra ruta) si ya está autenticado.
 * Útil para la página de login.
 */
export function RedirectIfAuthenticated({
  children,
  redirectTo = DASHBOARD_PATH,
}: RedirectIfAuthenticatedProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffffff] dark:bg-[#121212]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
