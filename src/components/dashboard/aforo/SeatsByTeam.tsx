"use client";

import { useMemo, useState } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useAuth } from "registro/hooks/use-auth";
import { isAdmin } from "registro/lib/auth";
import {
  SlowLoadNotice,
  WaitBar,
  useDelayedFlag,
} from "registro/components/shared/Skeleton";
import { GestionarAsientosModal } from "./GestionarAsientosModal";
import { GestionarEquiposModal } from "./GestionarEquiposModal";
import { BuscarEncontradoModal } from "./BuscarEncontradoModal";
import {
  SEATS_QUERY,
  type Seat,
  type SeatsQueryResponse,
} from "registro/graphql/aforo/queries";
import { TeamSeatsRow } from "./TeamSeatsRow";
import { useExportEncontradosExcel } from "./hooks";
import { SeatUpdateProvider } from "./seat-update-context";
import { AFORO_POLL_MS, countSeats, getSeatSex } from "./seat-utils";
import {
  AltarMarker,
  GenderHeading,
  SEATS_CARD_CLASS,
  SeatsActions,
  SeatsCardHeader,
  SeatsColumnsHeader,
  SeatsGrid,
  SeatsGridSkeleton,
} from "./SeatsShell";

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
  return (
    <GenderHeading sex={sex} align={align}>
      <p className="text-[0.6875rem] tabular-nums text-app-text-secondary dark:text-gray-400">
        <span className="font-semibold text-app-text-primary dark:text-gray-200">
          {ocupados}
        </span>{" "}
        ocupados · {libres} libres · {total} asientos
      </p>
    </GenderHeading>
  );
}

/**
 * Tarjeta "Asientos por equipo". Trae su esqueleto: en la primera carga se pintan el
 * encabezado, el altar y los encabezados de columna, y laten las filas. Al volver a
 * leer (refetch) el contenido se queda, atenuado, bajo la barra de espera. El refresco
 * automático (cada `AFORO_POLL_MS`) es silencioso: solo cambian los asientos. Si falla,
 * el error aparece en el mismo sitio con la opción de reintentar.
 */
export function SeatsByTeam() {
  const [showGestionarAsientos, setShowGestionarAsientos] = useState(false);
  const [showGestionarEquipos, setShowGestionarEquipos] = useState(false);
  const [showBuscarEncontradoModal, setShowBuscarEncontradoModal] =
    useState(false);
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { data, loading, error, refetch, networkStatus } =
    useQuery<SeatsQueryResponse>(SEATS_QUERY, {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      pollInterval: AFORO_POLL_MS,
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

  const firstLoad = loading && !data;
  const refreshing = useDelayedFlag(
    loading && Boolean(data) && networkStatus !== NetworkStatus.poll,
  );

  let body: React.ReactNode;
  if (error && !data) {
    body = (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudieron cargar los asientos.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-app-text-primary hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
        >
          Reintentar
        </button>
      </div>
    );
  } else if (firstLoad) {
    body = (
      <>
        <SeatsGridSkeleton />
        <SlowLoadNotice className="px-4 pb-4 text-center" />
      </>
    );
  } else if (groups.length === 0) {
    body = (
      <p className="px-4 py-12 text-center text-sm text-app-text-secondary dark:text-gray-400">
        No hay asientos configurados. Usa «Gestionar asientos» para crearlos.
      </p>
    );
  } else {
    body = (
      <div
        className={`p-2 transition-opacity duration-150 sm:p-4 ${refreshing ? "opacity-60" : ""}`}
      >
        <AltarMarker />
        <SeatsGrid>
          <SeatsColumnsHeader
            hombres={<GenderSummary sex="H" seats={hombres} align="end" />}
            mujeres={<GenderSummary sex="M" seats={mujeres} align="start" />}
          />
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
        </SeatsGrid>
      </div>
    );
  }

  return (
    <SeatUpdateProvider>
      <section
        aria-busy={firstLoad || refreshing}
        aria-label={firstLoad ? "Cargando asientos" : undefined}
        className={SEATS_CARD_CLASS}
      >
        <SeatsCardHeader
          actions={
            <SeatsActions
              admin={admin}
              onBuscar={() => setShowBuscarEncontradoModal(true)}
              onGestionarAsientos={
                data ? () => setShowGestionarAsientos(true) : undefined
              }
              onGestionarEquipos={() => setShowGestionarEquipos(true)}
              onExportar={
                seats.length > 0 ? () => exportEncontradosToExcel(seats) : undefined
              }
            />
          }
        />
        <WaitBar active={refreshing} />
        {body}
      </section>
      <GestionarAsientosModal
        open={showGestionarAsientos}
        onClose={() => setShowGestionarAsientos(false)}
        seats={seats}
      />
      {admin ? (
        <GestionarEquiposModal
          open={showGestionarEquipos}
          onClose={() => setShowGestionarEquipos(false)}
        />
      ) : null}
      <BuscarEncontradoModal
        open={showBuscarEncontradoModal}
        onClose={() => setShowBuscarEncontradoModal(false)}
      />
    </SeatUpdateProvider>
  );
}
