"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "registro/hooks/use-auth";
import { RedirectIfAuthenticated } from "registro/components/auth/redirect-if-authenticated";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.message ?? "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen items-center justify-center bg-brown-50 px-4 dark:bg-brown-900">
        <div className="w-full max-w-sm rounded-xl border border-brown-200 bg-white p-6 shadow-lg dark:border-brown-700 dark:bg-brown-800">
          <h1 className="mb-6 text-center text-xl font-semibold text-black-900 dark:text-blue-100">
            Iniciar sesión
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-black-800 dark:text-blue-200"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-brown-200 px-3 py-2 dark:border-brown-600 dark:bg-brown-900 dark:text-blue-100"
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-black-800 dark:text-blue-200"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-brown-200 px-3 py-2 pr-10 dark:border-brown-600 dark:bg-brown-900 dark:text-blue-100"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setShowPassword((v: boolean) => !v)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.074.298-2.077.835-2.975M9.88 9.882A3 3 0 1116.12 16.12M7.05 7.05l9.9 9.9"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.155.512-.35 1.013-.582 1.497"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
