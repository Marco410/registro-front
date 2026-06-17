import { SeatsByTeam } from "registro/components/dashboard";
import {
  AforoCountsCards,
  AnimatedMount,
  BautizoCountsCards,
} from "registro/components/shared";

export default function AforoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white">
          Aforo
        </h1>
        <p className="mt-2 text-app-text-secondary dark:text-gray-400">
          Asientos por equipo, divididos entre hombres y mujeres. Ocupado con
          color según sexo; vacío solo borde.
        </p>
      </div>
      <AforoCountsCards />
      <SeatsByTeam />
      <AnimatedMount show={true} animationKey="bautizo-counts-cards">
        <BautizoCountsCards />
      </AnimatedMount>
    </div>
  );
}
