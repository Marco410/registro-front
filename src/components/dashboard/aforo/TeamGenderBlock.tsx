"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Seat, SEATS_QUERY } from "registro/graphql/aforo/queries";
import {
  UPDATE_SEAT_MUTATION,
  type UpdateSeatVariables,
} from "registro/graphql/aforo/mutations";

const TEAM_LABEL_WIDTH = "min-w-[5.5rem] w-[5.5rem]";

export function TeamGenderBlock({
  teamKey,
  team,
  seats,
  sex,
}: {
  teamKey: string;
  team: Seat["team"];
  seats: Seat[];
  sex: "H" | "M";
}) {
  const teamLabel = team
    ? `Eq. ${team.teamNumber}${team.ageGroup?.label ? ` (${team.ageGroup.label})` : ""}`
    : "Sin equipo";

  return (
    <div key={`${teamKey}-${sex}`} className="flex w-full items-center gap-3">
      <p
        className={`shrink-0 truncate text-right text-[10px] font-medium leading-tight text-app-text-secondary dark:text-gray-400 ${TEAM_LABEL_WIDTH}`}
        title={teamLabel}
      >
        {teamLabel}
      </p>
      <div className="min-w-0 flex-1 flex flex-wrap gap-1">
        {seats.length === 0 ? (
          <span className="text-[10px] text-app-text-secondary dark:text-gray-400">
            Sin asientos
          </span>
        ) : (
          seats.map((seat) => <SeatBox key={seat.id} seat={seat} sex={sex} />)
        )}
      </div>
    </div>
  );
}

const SEAT_SIZE = "h-7 w-7";
const SEAT_TEXT = "text-xs";

function ocupadoPor(seat: Seat): string {
  if (!seat.occupied || !seat.encontrado) return "";
  const e = seat.encontrado;
  return `${e.nombre} ${e.apellido_p} ${e.apellido_m}`.trim();
}

function SeatBox({ seat, sex }: { seat: Seat; sex: "H" | "M" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [updateSeat, { loading: updating }] = useMutation<
    unknown,
    UpdateSeatVariables
  >(UPDATE_SEAT_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
  });

  const occupied = seat.occupied;
  const abandoned = seat.abandoned;
  const isMale = sex === "H";
  const canDarDeBaja = occupied && seat.encontrado?.id && !abandoned;

  const filledClass = abandoned
    ? "bg-gray-400/90 text-white border-gray-500 dark:bg-gray-600 dark:border-gray-500"
    : occupied
      ? isMale
        ? "bg-app-primary/90 text-white border-app-primary dark:bg-app-primary-muted dark:border-app-primary-muted"
        : "bg-pink-500/90 text-white border-pink-500 dark:bg-pink-500 dark:border-pink-500"
      : "bg-transparent border-gray-300 text-app-text-secondary dark:border-gray-600 dark:text-gray-400";

  const tooltipText = abandoned
    ? seat.abandonedBy
      ? `Baja: ${seat.abandonedBy.nombre} ${seat.abandonedBy.apellido_p} ${seat.abandonedBy.apellido_m}`
      : "Dado de baja"
    : occupied && seat.encontrado
      ? `${seat.encontrado.nombre} ${seat.encontrado.apellido_p} ${seat.encontrado.apellido_m} | ${seat.gender}${seat.team?.teamNumber}${seat.letter}`
      : null;

  const handleDarDeBaja = async () => {
    if (!seat.encontrado?.id) return;
    await updateSeat({
      variables: {
        where: { id: seat.id },
        data: {
          abandoned: true,
          occupied: false,
          abandonedBy: { connect: { id: seat.encontrado.id } },
        },
      },
    });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="group relative inline-flex">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex shrink-0 cursor-pointer items-center justify-center rounded border ${SEAT_SIZE} ${SEAT_TEXT} font-medium transition-colors hover:ring-2 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500 ${filledClass}`}
          aria-label={tooltipText ?? seat.letter ?? seat.id}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {seat.letter || seat.id.slice(0, 2)}
        </button>
        {!menuOpen && tooltipText && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700"
          >
            {tooltipText}
            <span
              className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
              aria-hidden
            />
          </span>
        )}

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="absolute bottom-full left-0 z-50 mb-1 min-w-[12rem] rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#202124]"
            >
              {occupied && seat.encontrado ? (
                <div
                  role="none"
                  className="border-b border-gray-100 px-3 py-2 text-xs text-app-text-secondary dark:border-gray-700 dark:text-gray-400"
                >
                  Asiento ocupado por: {ocupadoPor(seat)}
                </div>
              ) : null}
              <button
                type="button"
                role="menuitem"
                disabled={!canDarDeBaja}
                onClick={() => {
                  setMenuOpen(false);
                  if (canDarDeBaja) setShowConfirm(true);
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Dar de baja
              </button>
            </div>
          </>
        )}
      </div>

      {showConfirm && (
        <ConfirmDarDeBajaModal
          open={showConfirm}
          ocupadoPor={ocupadoPor(seat)}
          loading={updating}
          onConfirm={handleDarDeBaja}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

interface ConfirmDarDeBajaModalProps {
  open: boolean;
  ocupadoPor: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

function ConfirmDarDeBajaModal({
  open,
  ocupadoPor,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDarDeBajaModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dar-de-baja-modal-title"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-xl dark:border-gray-700 dark:bg-[#202124]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="dar-de-baja-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          ¿Dar de baja este asiento?
        </h2>
        <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
          Se marcará el asiento como abandonado y se desocupará. El encontrado{" "}
          {ocupadoPor ? <strong>{ocupadoPor}</strong> : "asignado"} quedará
          registrado como quien abandonó el asiento.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? "Guardando…" : "Dar de baja"}
          </button>
        </div>
      </div>
    </div>
  );
}
