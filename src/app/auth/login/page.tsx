"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "registro/components/shared/Logo";
import { useAuth } from "registro/hooks/use-auth";
import { RedirectIfAuthenticated } from "registro/components/auth/redirect-if-authenticated";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(email, password);

      if (response.success) {
        router.push(redirectTo);
      } else {
        setError(response.message ?? "Error al iniciar sesión");
      }
    } catch {
      setError("Ha ocurrido un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#ffffff] dark:bg-[#121212]">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8 text-[#212121] dark:text-[#ffffff] hover:opacity-80 transition-opacity"
        >
          <Logo size={56} />
          <span className="text-2xl font-bold text-blue-500">A&R Morelia</span>
        </Link>

        <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-3xl p-8 border border-brown-100 dark:border-brown-800">
          <h1 className="text-2xl font-bold text-blue-500 text-center mb-2">
            Iniciar sesión
          </h1>
          <p className="text-brown-700 dark:text-brown-300 text-center text-sm mb-6">
            Ingresa tu correo y contraseña
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleLogin}
          >
            {error ? (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
              >
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-brown-700 dark:text-brown-300 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brown-200 dark:border-brown-700 bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-brown-700 dark:text-brown-300 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brown-200 dark:border-brown-700 bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brown-600 dark:text-brown-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/registro"
              className="text-blue-500 font-medium hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-brown-600 dark:text-brown-400 hover:text-blue-500 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
    </RedirectIfAuthenticated>
  );
}
