"use client";

import dynamic from "next/dynamic";
import { SeatsByTeamSkeleton } from "./SeatsShell";

/**
 * Mientras llega el código de SeatsByTeam se muestra la misma tarjeta en esqueleto
 * que SeatsByTeam usa mientras llegan los datos, así el cambio no mueve nada.
 */
const SeatsByTeam = dynamic(
  () => import("./SeatsByTeam").then((mod) => mod.SeatsByTeam),
  {
    ssr: false,
    loading: () => <SeatsByTeamSkeleton />,
  },
);

export function SeatsByTeamLazy() {
  return <SeatsByTeam />;
}
