"use client";

import { useAuth } from "registro/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdmin } from "registro/lib/auth";
import { routes } from "registro/constants/routes";

/**
 * Protege rutas de administración: si el usuario no tiene rol admin, redirige al dashboard.
 * Debe usarse dentro de `RequireAuth` (el layout de /dashboard ya lo aplica).
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = isAdmin(user);

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) router.replace(routes.dashboard());
  }, [allowed, isLoading, router]);

  if (isLoading || !allowed) return null;

  return <>{children}</>;
}
