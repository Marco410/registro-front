import { AforoCountsCards } from "registro/components/shared";
import {
  EstadoCivilCounts,
  ReligionCounts,
} from "registro/components/dashboard";

export default function StatisticsPage() {
  return (
    <div className="w-full max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white">
        Estadísticas
      </h1>
      <p className="mt-2 text-app-text-secondary dark:text-gray-400">
        Estadísticas de los encontrados.
      </p>
      <div className="mt-8">
        <AforoCountsCards />
      </div>
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold tracking-tight text-app-text-primary dark:text-white">
          Estado civil
        </h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EstadoCivilCounts />
        <EstadoCivilCounts sex="H" />
        <EstadoCivilCounts sex="M" />
      </div>
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold tracking-tight text-app-text-primary dark:text-white">
          Religión
        </h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReligionCounts />
        <ReligionCounts sex="H" />
        <ReligionCounts sex="M" />
      </div>
    </div>
  );
}
