"use client";

import { memo, useState } from "react";
import type { Seat } from "registro/graphql/aforo/queries";
import { SeatBox } from "./SeatBox";
import { TeamSeatsModal } from "./TeamSeatsModal";
import {
  SEX_STYLES,
  TEAM_ROW_GRID,
  countSeats,
  type RangoEdad,
} from "./seat-utils";


type Sexo = "H" | "M";

/** "ocupados/total" del equipo para un sexo; abre la lista de ese sexo. */
function SeatCountButton({
  sex,
  seats,
  teamName,
  onClick,
  className = "",
}: {
  sex: Sexo;
  seats: Seat[];
  teamName: string;
  onClick?: () => void;
  className?: string;
}) {
  const { total, ocupados, libres } = countSeats(seats);
  const style = SEX_STYLES[sex];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={`${style.label}: ${ocupados} ocupados, ${libres} libres. Clic para ver la lista.`}
      aria-label={`Ver lista de ${style.label.toLowerCase()} del ${teamName}: ${ocupados} de ${total} ocupados`}
      className={`shrink-0 rounded-md px-1.5 py-1 text-[0.6875rem] font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:cursor-default xl:py-0.5 ${style.text} ${style.hover} ${className}`}
    >
      <span className="xl:hidden">{sex} </span>
      {ocupados}/{total}
    </button>
  );
}

function SeatsLine({
  seats,
  sex,
  getRangoEdad,
  className = "",
}: {
  seats: Seat[];
  sex: Sexo;
  getRangoEdad?: (seat: Seat) => RangoEdad | null;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <span
        className={`w-4 shrink-0 text-[0.6875rem] font-semibold xl:hidden ${SEX_STYLES[sex].text}`}
        aria-hidden
      >
        {sex}
      </span>
      {seats.length === 0 ? (
        <span className="text-[0.6875rem] italic text-app-text-secondary dark:text-gray-500">
          Sin asientos
        </span>
      ) : (
        seats.map((seat) => (
          <SeatBox
            key={seat.id}
            seat={seat}
            sex={sex}
            rangoEdad={getRangoEdad?.(seat) ?? null}
          />
        ))
      )}
    </div>
  );
}

export interface TeamSeatsRowProps {
  team: Seat["team"];
  hombres: Seat[];
  mujeres: Seat[];
  /** Qué tan lejos de su rango de edad está cada encontrado (círculo naranja o rojo). */
  getRangoEdad?: (seat: Seat) => RangoEdad | null;
}

/**
 * Fila de un equipo. En pantallas anchas: hombres a la izquierda (pegados al
 * pasillo), el equipo con sus conteos al centro y mujeres a la derecha. En
 * pantallas angostas se apila: equipo, línea de hombres y línea de mujeres.
 */
function TeamSeatsRowComponent({
  team,
  hombres,
  mujeres,
  getRangoEdad,
}: TeamSeatsRowProps) {
  const [listSex, setListSex] = useState<Sexo | null>(null);

  const teamName = team?.teamName ?? "Sin equipo";
  const ageGroup = team?.ageGroup?.label ?? "";
  const teamLabel = ageGroup ? `${teamName} (${ageGroup})` : teamName;
  const openList = (sex: Sexo) => (team ? () => setListSex(sex) : undefined);

  return (
    <div
      className={`relative grid grid-cols-1 gap-x-3 gap-y-1.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-500/5 dark:hover:bg-white/5 xl:py-1 ${TEAM_ROW_GRID}`}
    >
      <SeatsLine
        seats={hombres}
        sex="H"
        getRangoEdad={getRangoEdad}
        className="order-2 xl:order-1 xl:justify-end"
      />

      <div className="order-1 flex items-center gap-1 xl:order-2 xl:grid xl:grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]">
        <div className="mr-2 min-w-0 xl:order-2 xl:mr-0 xl:text-center">
          <p className="truncate text-xs font-semibold text-app-text-primary dark:text-gray-100">
            {teamName}
          </p>
          {ageGroup ? (
            <p className="truncate text-[0.625rem] leading-tight text-app-text-secondary dark:text-gray-400">
              {ageGroup}
            </p>
          ) : null}
        </div>
        <SeatCountButton
          sex="H"
          seats={hombres}
          teamName={teamName}
          onClick={openList("H")}
          className="xl:order-1 xl:justify-self-start"
        />
        <SeatCountButton
          sex="M"
          seats={mujeres}
          teamName={teamName}
          onClick={openList("M")}
          className="xl:order-3 xl:justify-self-end"
        />
      </div>

      <SeatsLine
        seats={mujeres}
        sex="M"
        getRangoEdad={getRangoEdad}
        className="order-3"
      />

      {listSex && team ? (
        <TeamSeatsModal
          open
          onClose={() => setListSex(null)}
          teamLabel={teamLabel}
          seats={listSex === "H" ? hombres : mujeres}
          sex={listSex}
        />
      ) : null}
    </div>
  );
}

export const TeamSeatsRow = memo(TeamSeatsRowComponent);
