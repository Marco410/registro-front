"use client";

import { useQuery } from "@apollo/client";
import {
  MANTENIMIENTO_QUERY,
  type MantenimientoQueryResponse,
} from "registro/graphql/mantenimiento/queries";
import {
  GenerarEquiposPanel,
  LimpiarBasePanel,
} from "registro/components/dashboard/mantenimiento";

export default function BaseDeDatosPage() {
  const { data, loading, error } =
    useQuery<MantenimientoQueryResponse>(MANTENIMIENTO_QUERY);
  const firstLoad = loading && !data;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="border-l-4 border-app-primary pl-4">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
          Base de datos
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Genera equipos y asientos como el seed, o limpia la base para empezar
          otro evento. Cada acción queda en la bitácora de auditoría.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar los datos: {error.message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)] xl:items-start">
        <GenerarEquiposPanel
          ageGroups={data?.ageGroups ?? []}
          loading={firstLoad}
        />
        <LimpiarBasePanel data={data} loading={firstLoad} />
      </div>
    </div>
  );
}
