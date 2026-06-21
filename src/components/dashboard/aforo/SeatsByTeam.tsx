"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Add01Icon, Download01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddSeatModal } from "./AddSeatModal";
import { BuscarEncontradoModal } from "./BuscarEncontradoModal";
import {
  SEATS_QUERY,
  type Seat,
  type SeatsQueryResponse,
} from "registro/graphql/aforo/queries";
import { TeamGenderBlock } from "./TeamGenderBlock";
import { useExportEncontradosExcel } from "./hooks";
import { SeatUpdateProvider } from "./seat-update-context";

function getSeatSex(seat: Seat): "H" | "M" {
  const sex = seat.gender || seat.encontrado?.sexo || "";
  return sex === "M" ? "M" : "H";
}

type TeamGenderGroup = {
  team: Seat["team"];
  key: string;
  hombres: Seat[];
  mujeres: Seat[];
};

function buildTeamGenderGroups(seats: Seat[]): TeamGenderGroup[] {
  const byTeam = new Map<string, TeamGenderGroup>();

  for (const seat of seats) {
    const team = seat.team;
    const key = team
      ? `${team.teamNumber}-${team.teamName}-${team.ageGroup?.label ?? ""}`
      : "sin-equipo";

    if (!byTeam.has(key)) {
      byTeam.set(key, { team, key, hombres: [], mujeres: [] });
    }

    const group = byTeam.get(key)!;
    if (getSeatSex(seat) === "M") {
      group.mujeres.push(seat);
    } else {
      group.hombres.push(seat);
    }
  }

  return Array.from(byTeam.values()).sort((a, b) => {
    if (!a.team || !b.team) return a.key.localeCompare(b.key);
    const orderA = a.team.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.team.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

export function SeatsByTeam() {
  const [showAddSeatModal, setShowAddSeatModal] = useState(false);
  const [showBuscarEncontradoModal, setShowBuscarEncontradoModal] =
    useState(false);
  const { data, loading, error } = useQuery<SeatsQueryResponse>(SEATS_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    //pollInterval: 10000,
  });
  const { exportEncontradosToExcel } = useExportEncontradosExcel();

  const seats = data?.seats ?? [];
  const groups = useMemo(() => buildTeamGenderGroups(seats), [seats]);

  if (loading && !data) {
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

  const actionButtonClass =
    "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-app-primary-muted";

  return (
    <SeatUpdateProvider>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]">
        <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80 md:flex-row md:items-center md:justify-between md:gap-0 md:py-5">
          <span className="text-center text-xs font-bold uppercase tracking-widest text-app-primary dark:text-app-primary-muted md:text-left">
            Altar
          </span>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:mt-0 md:justify-end">
            <button
              type="button"
              aria-label="Buscar encontrado"
              onClick={() => setShowBuscarEncontradoModal(true)}
              className={`${actionButtonClass} border-blue-500`}
              style={{ borderWidth: '2px' }}
            >
              <HugeiconsIcon icon={Search01Icon} size={18} className="shrink-0 text-blue-500" />
              <span className="max-w-[140px] truncate text-blue-500">Buscar encontrado</span>
            </button>
       
            <button
              type="button"
              aria-label="Agregar asiento a un equipo"
              onClick={() => setShowAddSeatModal(true)}
              className={actionButtonClass}
            >
              <HugeiconsIcon icon={Add01Icon} size={18} className="shrink-0" />
              <span className="max-w-[140px] truncate">Agregar asiento</span>
            </button>
            <button
              type="button"
              aria-label="Exportar encontrados en Excel"
              onClick={() => exportEncontradosToExcel(seats)}
              disabled={!seats.length}
              className={actionButtonClass}
            >
              <HugeiconsIcon icon={Download01Icon} size={18} className="shrink-0" />
              <span className="max-w-[140px] truncate">
                Exportar encontrados (Excel)
              </span>
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-app-text-secondary dark:text-gray-400">
            No hay asientos configurados.
          </p>
        ) : (
        <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-app-primary dark:text-app-primary-muted">
              Hombres
            </p>
            <div className="flex w-full flex-col items-center gap-1">
              {groups.map(({ team, key, hombres }) => (
                <TeamGenderBlock
                  key={`${key}-H`}
                  team={team}
                  seats={hombres}
                  sex="H"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Mujeres
            </p>
            <div className="flex w-full flex-col items-center gap-1">
              {groups.map(({ team, key, mujeres }) => (
                <TeamGenderBlock
                  key={`${key}-M`}
                  team={team}
                  seats={mujeres}
                  sex="M"
                />
              ))}
            </div>
          </div>
        </div>
        )}

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
            <div className="h-5 w-5 rounded border-2 border-gray-400 bg-gray-400/90" />
            <span className="text-xs text-app-text-secondary dark:text-gray-400">
              Dado de baja
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border-2 border-gray-300 bg-transparent dark:border-gray-600" />
            <span className="text-xs text-app-text-secondary dark:text-gray-400">
              Libre
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500/90" />
            <span className="text-xs text-app-text-secondary dark:text-gray-400">
              Bautizado
            </span>
          </div>
        </div>
      </div>
      <AddSeatModal
        open={showAddSeatModal}
        onClose={() => setShowAddSeatModal(false)}
      />
      <BuscarEncontradoModal
        open={showBuscarEncontradoModal}
        onClose={() => setShowBuscarEncontradoModal(false)}
      />
    </SeatUpdateProvider>
  );
}
