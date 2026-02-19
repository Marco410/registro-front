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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-brown-200 px-3 py-2 dark:border-brown-600 dark:bg-brown-900 dark:text-blue-100"
                placeholder="Contraseña"
              />
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
