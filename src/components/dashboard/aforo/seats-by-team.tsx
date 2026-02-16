"use client";

import { useQuery } from "@apollo/client";
import {
  SEATS_QUERY,
  type Seat,
  type SeatsQueryResponse,
} from "registro/graphql/aforo/queries";
import { TeamGenderBlock } from "./TeamGenderBlock";

function getSeatSex(seat: Seat): "H" | "M" {
  const sex = seat.gender || seat.encontrado?.sexo || "";
  return sex === "M" ? "M" : "H";
}

function groupSeatsByTeam(seats: Seat[]) {
  const byTeam = new Map<
    string,
    { team: Seat["team"]; key: string; seats: Seat[] }
  >();
  for (const seat of seats) {
    const team = seat.team;
    const key = team
      ? `${team.teamNumber}-${team.teamName}-${team.ageGroup?.label ?? ""}`
      : "sin-equipo";
    if (!byTeam.has(key)) {
      byTeam.set(key, { team, key, seats: [] });
    }
    byTeam.get(key)!.seats.push(seat);
  }
  return Array.from(byTeam.values()).sort((a, b) => {
    if (!a.team || !b.team) return a.key.localeCompare(b.key);
    return a.team.teamNumber - b.team.teamNumber;
  });
}

function splitByGender(seats: Seat[]): { hombres: Seat[]; mujeres: Seat[] } {
  const hombres: Seat[] = [];
  const mujeres: Seat[] = [];
  for (const s of seats) {
    if (getSeatSex(s) === "M") mujeres.push(s);
    else hombres.push(s);
  }
  return { hombres, mujeres };
}

export function SeatsByTeam() {
  const { data, loading, error } = useQuery<SeatsQueryResponse>(SEATS_QUERY);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Error al cargar los asientos
      </p>
    );
  }

  const seats = data?.seats ?? [];
  const groups = groupSeatsByTeam(seats);

  if (groups.length === 0) {
    return (
      <p className="text-app-text-secondary dark:text-gray-400">
        No hay asientos configurados.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]">
      {/* Escenario */}
      <div className="flex items-center justify-center border-b border-gray-200 bg-gray-100 py-3 dark:border-gray-700 dark:bg-gray-800/80">
        <span className="text-xs font-semibold uppercase tracking-widest text-app-text-secondary dark:text-gray-400">
          Escenario
        </span>
      </div>
      {/* Sala: izquierda = hombres, derecha = mujeres (vista desde el escenario) */}
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col items-stretch gap-3">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-app-primary dark:text-app-primary-muted">
            Hombres
          </p>
          <div className="flex flex-col gap-2">
            {groups.map(({ team, key, seats: teamSeats }) => {
              const { hombres } = splitByGender(teamSeats);
              return (
                <TeamGenderBlock
                  key={key}
                  teamKey={key}
                  team={team}
                  seats={hombres}
                  sex="H"
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-3">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            Mujeres
          </p>
          <div className="flex flex-col gap-2">
            {groups.map(({ team, key, seats: teamSeats }) => {
              const { mujeres } = splitByGender(teamSeats);
              return (
                <TeamGenderBlock
                  key={key}
                  teamKey={key}
                  team={team}
                  seats={mujeres}
                  sex="M"
                />
              );
            })}
          </div>
        </div>
      </div>
      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 px-4 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-app-primary bg-app-primary/90 dark:bg-app-primary-muted" />
          <span className="text-xs text-app-text-secondary dark:text-gray-400">
            Hombres (ocupado)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-pink-500 bg-pink-500/90" />
          <span className="text-xs text-app-text-secondary dark:text-gray-400">
            Mujeres (ocupado)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-gray-300 bg-transparent dark:border-gray-600" />
          <span className="text-xs text-app-text-secondary dark:text-gray-400">
            Libre
          </span>
        </div>
      </div>
    </div>
  );
}
