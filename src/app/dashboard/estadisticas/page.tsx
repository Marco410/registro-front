import { EstadisticasDashboard } from "registro/components/dashboard/estadisticas/EstadisticasDashboard";

export default function StatisticsPage() {
  return (
    <div className="w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white">
          Estadísticas
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Datos de los encontrados. Se actualizan solos cada 30 segundos.
        </p>
      </div>
      <EstadisticasDashboard />
    </div>
  );
}
