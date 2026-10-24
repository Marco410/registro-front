"use client";

import { useAuth } from "registro/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Protege rutas: solo muestra children cuando hay sesión. Mientras se resuelve
 * la auth muestra un loader breve; si el servidor confirma que no hay sesión,
 * redirige a login. Si no se pudo conectar (y no hay un usuario guardado), avisa
 * y reintenta en lugar de mandar al login: la sesión sigue guardada.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, connectionError, refreshUser } = useAuth();
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (isLoading || connectionError) return;
    if (!user) router.replace("/auth/login");
  }, [user, isLoading, connectionError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-app-surface dark:bg-[#202124] animate-pulse">
        <header className="h-16 w-full border-b border-app-border bg-white/50 dark:bg-[#232326]/60 flex items-center px-4">
          <div className="h-8 w-32 bg-app-border/60 rounded" />
        </header>
        <div className="flex flex-1">
          <aside className="hidden md:flex flex-col w-56 border-r border-app-border bg-white/30 dark:bg-[#222325]/40 px-4 py-8 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 w-40 rounded bg-app-border/40 mb-4" />
            ))}
          </aside>
          <main className="flex-1 p-6 flex flex-col gap-6">
            <div className="h-10 w-2/3 bg-app-border/60 rounded" />
            <div className="h-96 w-full bg-app-border/40 rounded" />
          </main>
        </div>
      </div>
    );
  }

  if (!user && connectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-surface px-4 dark:bg-[#202124]">
        <div
          role="alert"
          className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-[#2a2b2e]"
        >
          <h1 className="text-base font-semibold text-app-text-primary dark:text-white">
            No se pudo conectar con el servidor
          </h1>
          <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
            Tu sesión sigue guardada en este equipo. Revisa la conexión; se
            vuelve a intentar sola en unos segundos.
          </p>
          <button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await refreshUser();
              setRetrying(false);
            }}
            className="mt-5 rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-app-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-app-primary-muted dark:text-gray-900"
          >
            {retrying ? "Reintentando…" : "Reintentar"}
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
