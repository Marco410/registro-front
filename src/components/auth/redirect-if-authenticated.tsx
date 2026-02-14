"use client";

import { useAuth } from "registro/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Muestra children (ej. login) de inmediato. Si la sesión resulta estar activa,
 * redirige a /dashboard sin bloquear con una pantalla de carga.
 */
export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  if (!isLoading && user) return null;

  return <>{children}</>;
}
