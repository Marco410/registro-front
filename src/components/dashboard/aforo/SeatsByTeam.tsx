"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Download01Icon,
  Search01Icon,
  SeatSelectorIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { GestionarAsientosModal } from "./GestionarAsientosModal";
import { BuscarEncontradoModal } from "./BuscarEncontradoModal";
import {
  SEATS_QUERY,
  type Seat,
  type SeatsQueryResponse,
} from "registro/graphql/aforo/queries";
import { TEAM_ROW_GRID, TeamSeatsRow } from "./TeamSeatsRow";
import { useExportEncontradosExcel } from "./hooks";
import { SeatUpdateProvider } from "./seat-update-context";
import { SEX_STYLES, countSeats, getSeatSex } from "./seat-utils";

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

const LEGEND_ITEMS = [
  {
    label: "Libre",
    className:
      "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60",
  },
  {
    label: "Ocupado · hombre",
    className:
      "border-app-primary/45 bg-app-primary dark:border-app-primary-muted/50 dark:bg-app-primary-muted",
  },
  {
    label: "Ocupado · mujer",
    className: "border-pink-400/45 bg-pink-500",
  },
  {
    label: "Dado de baja",
    className: "border-gray-400/50 bg-gray-500 dark:bg-gray-600",
  },
];

function SeatsLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {LEGEND_ITEMS.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-[11px] text-app-text-secondary dark:text-gray-400"
        >
          <span
            className={`h-3.5 w-3.5 rounded-[3px] border ${item.className}`}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5 text-[11px] text-app-text-secondary dark:text-gray-400">
        <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
        Bautizado
      </li>
    </ul>
  );
}

/** Totales de un sexo: ocupados, libres y asientos en total. */
function GenderSummary({
  sex,
  seats,
  align,
}: {
  sex: "H" | "M";
  seats: Seat[];
  align: "start" | "end";
}) {
  const { total, ocupados, libres } = countSeats(seats);
  const style = SEX_STYLES[sex];
  return (
    <div className={align === "end" ? "xl:text-right" : "text-left"}>
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
      >
        {style.label}
      </p>
      <p className="text-[11px] tabular-nums text-app-text-secondary dark:text-gray-400">
        <span className="font-semibold text-app-text-primary dark:text-gray-200">
          {ocupados}
        </span>{" "}
        ocupados · {libres} libres · {total} asientos
      </p>
    </div>
  );
}

function SeatsSkeleton() {
  return (
    <div className="h-[32rem] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
  );
}

export function SeatsByTeam() {
  const [showGestionarAsientos, setShowGestionarAsientos] = useState(false);
  const [showBuscarEncontradoModal, setShowBuscarEncontradoModal] =
    useState(false);
  const { data, loading, error } = useQuery<SeatsQueryResponse>(SEATS_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    //pollInterval: 10000,
  });
  const { exportEncontradosToExcel } = useExportEncontradosExcel();

  const seats = useMemo(() => data?.seats ?? [], [data]);
  const groups = useMemo(() => buildTeamGenderGroups(seats), [seats]);
  const { hombres, mujeres } = useMemo(
    () => ({
      hombres: groups.flatMap((g) => g.hombres),
      mujeres: groups.flatMap((g) => g.mujeres),
    }),
    [groups],
  );

  if (loading && !data) {
    return <SeatsSkeleton />;
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
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-base font-semibold text-app-text-primary dark:text-white">
              Asientos por equipo
            </h2>
            <SeatsLegend />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBuscarEncontradoModal(true)}
              className="flex items-center gap-2 rounded-lg bg-app-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-app-primary/90 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2 dark:bg-app-primary-muted dark:text-gray-900 dark:hover:bg-app-primary-muted/90"
            >
              <HugeiconsIcon icon={Search01Icon} size={16} className="shrink-0" />
              Buscar encontrado
            </button>
            <button
              type="button"
              aria-label="Agregar o quitar asientos de los equipos"
              onClick={() => setShowGestionarAsientos(true)}
              className={actionButtonClass}
            >
              <HugeiconsIcon icon={SeatSelectorIcon} size={16} className="shrink-0" />
              Gestionar asientos
            </button>
            <button
              type="button"
              aria-label="Exportar encontrados en Excel"
              title="Exportar encontrados en Excel"
              onClick={() => exportEncontradosToExcel(seats)}
              disabled={!seats.length}
              className={actionButtonClass}
            >
              <HugeiconsIcon icon={Download01Icon} size={16} className="shrink-0" />
              Exportar Excel
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-app-text-secondary dark:text-gray-400">
            No hay asientos configurados. Usa «Gestionar asientos» para crearlos.
          </p>
        ) : (
          <div className="p-2 sm:p-4">
            <div className="mb-3 flex flex-col items-center gap-1" aria-hidden>
              <div className="h-1.5 w-full max-w-sm rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-app-text-secondary dark:text-gray-400">
                Altar
              </span>
            </div>

            {/*
              El tamaño de asiento (xl+) se calcula con el ancho de este
              contenedor, no de la ventana, para que caigan 18 asientos por
              lado con o sin la barra lateral: (50cqw − 100px de pasillo y
              márgenes − 17 huecos de 4px) / 18, entre 20px y 28px.
            */}
            <div className="relative [--seat-size:clamp(20px,calc((50cqw_-_168px)_/_18),28px)] [container-type:inline-size]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-40 -translate-x-1/2 rounded-xl bg-gray-50 dark:bg-white/[0.03] xl:block"
              />

              <div
                className={`relative grid grid-cols-2 gap-x-3 gap-y-2 px-2 pb-2 ${TEAM_ROW_GRID}`}
              >
                <GenderSummary sex="H" seats={hombres} align="end" />
                <p className="hidden self-end text-center text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400 xl:block">
                  Equipo
                </p>
                <GenderSummary sex="M" seats={mujeres} align="start" />
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 xl:divide-y-0">
                {groups.map(({ team, key, hombres, mujeres }) => (
                  <TeamSeatsRow
                    key={key}
                    team={team}
                    hombres={hombres}
                    mujeres={mujeres}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      <GestionarAsientosModal
        open={showGestionarAsientos}
        onClose={() => setShowGestionarAsientos(false)}
        seats={seats}
      />
      <BuscarEncontradoModal
        open={showBuscarEncontradoModal}
        onClose={() => setShowBuscarEncontradoModal(false)}
      />
    </SeatUpdateProvider>
  );
}
