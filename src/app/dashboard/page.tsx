import { DashboardCountsCards } from "registro/components/dashboard";

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
        <DashboardCountsCards />
      </div>
    </div>
  );
}
