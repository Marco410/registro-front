"use client";

import { useAuth } from "registro/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Protege rutas: solo muestra children cuando hay sesión. Mientras se resuelve
 * la auth muestra un loader breve; si no hay usuario, redirige a login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/auth/login");
  }, [user, isLoading, router]);

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

  if (!user) return null;

  return <>{children}</>;
}
