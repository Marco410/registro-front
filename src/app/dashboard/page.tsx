import { AforoCountsCards } from "registro/components/shared";
import { EstadoCivilBarChart } from "registro/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="w-full max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white">
        Inicio
      </h1>
      <p className="mt-2 text-app-text-secondary dark:text-gray-400">
        Bienvenido al dashboard. Use el menú para navegar a Checkin o Registro.
      </p>
      <div className="mt-8">
        <AforoCountsCards />
      </div>
      <div className="mt-8 flex justify-start">
        <EstadoCivilBarChart />
      </div>
      <div className="mt-8 flex justify-start gap-4">
        <EstadoCivilBarChart sex="H" />
        <EstadoCivilBarChart sex="M" />
      </div>
    </div>
  );
}
