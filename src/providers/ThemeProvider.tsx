"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { type ReactNode, useEffect } from "react";

// Componente interno para asegurar que solo usamos 'dark' y no 'light'
function ThemeMonitor() {
  const { resolvedTheme } = useNextTheme();

  useEffect(() => {
    // Asegurar que solo usamos 'dark' y no 'light'
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      if (resolvedTheme === "light") {
        // Remover 'dark' y 'light' para light mode
        html.classList.remove("dark", "light");
      } else if (resolvedTheme === "dark") {
        // Solo agregar 'dark', remover 'light' si existe
        html.classList.remove("light");
        html.classList.add("dark");
      }
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="registro-theme"
      disableTransitionOnChange={false}
    >
      <ThemeMonitor />
      {children}
    </NextThemesProvider>
  );
}
