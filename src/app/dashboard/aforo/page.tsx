import { AforoResumen } from "registro/components/dashboard/aforo/AforoResumen";
import { SeatsByTeamLazy } from "registro/components/dashboard/aforo/SeatsByTeamLazy";
import {
  AnimatedMount,
  BautizoCountsCards,
} from "registro/components/shared";

export default function AforoPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white">
            Aforo
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-app-text-secondary dark:text-gray-400">
            Haz clic en un asiento para ver sus acciones, o en el conteo de un
            equipo para ver su lista.
          </p>
        </div>
        <AforoResumen />
      </header>
      <SeatsByTeamLazy />
      <AnimatedMount show={true} animationKey="bautizo-counts-cards">
        <BautizoCountsCards />
      </AnimatedMount>
    </div>
  );
}
