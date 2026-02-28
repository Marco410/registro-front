"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Seat } from "registro/graphql/aforo/queries";
import { useExportBautizosExcel, useExportSeatsExcel } from "./hooks";

export interface TeamSeatsModalProps {
  open: boolean;
  onClose: () => void;
  teamLabel: string;
  seats: Seat[];
  sex: "H" | "M";
}

const UPDATE_TEAM_MUTATION = gql`
  mutation UpdateTeam($where: TeamWhereUniqueInput!, $data: TeamUpdateInput!) {
    updateTeam(where: $where, data: $data) {
      id
      captain
      auxiliar1
      auxiliar2
      auxiliar3
      captain_h
      auxiliar1_h
      auxiliar2_h
      auxiliar3_h
    }
  }
`;

export function TeamSeatsModal({
  open,
  onClose,
  teamLabel,
  seats,
  sex,
}: TeamSeatsModalProps) {
  if (!open) return null;

  const filteredSeats = seats?.filter((seat) => seat.gender === sex) ?? [];
  const teamInfo = seats[0]?.team ?? null;
  const isHombres = sex === "H";
  const initialCaptain = isHombres
    ? (teamInfo?.captain_h ?? "")
    : (teamInfo?.captain ?? "");
  const initialAux1 = isHombres
    ? (teamInfo?.auxiliar1_h ?? "")
    : (teamInfo?.auxiliar1 ?? "");
  const initialAux2 = isHombres
    ? (teamInfo?.auxiliar2_h ?? "")
    : (teamInfo?.auxiliar2 ?? "");
  const initialAux3 = isHombres
    ? (teamInfo?.auxiliar3_h ?? "")
    : (teamInfo?.auxiliar3 ?? "");

  const [captain, setCaptain] = useState(initialCaptain);
  const [aux1, setAux1] = useState(initialAux1);
  const [aux2, setAux2] = useState(initialAux2);
  const [aux3, setAux3] = useState(initialAux3);

  const [updateTeam, { loading: saving }] = useMutation(UPDATE_TEAM_MUTATION);
  const { exportSeatsToExcel } = useExportSeatsExcel();
  const { exportBautizosToExcel } = useExportBautizosExcel();

  const getEncontradoNombre = (seat: Seat) => {
    if (!seat.encontrado) return "—";
    const { nombre, apellido_p, apellido_m } = seat.encontrado;
    return [nombre.trim(), apellido_p.trim(), apellido_m.trim()]
      .filter(Boolean)
      .join(" ");
  };

  const handleSaveTeam = async () => {
    if (!teamInfo?.id) return;
    try {
      const data =
        sex === "H"
          ? {
              captain_h: captain,
              auxiliar1_h: aux1,
              auxiliar2_h: aux2,
              auxiliar3_h: aux3,
            }
          : {
              captain,
              auxiliar1: aux1,
              auxiliar2: aux2,
              auxiliar3: aux3,
            };
      await updateTeam({
        variables: {
          where: { id: teamInfo.id },
          data,
        },
      });
    } catch {}
  };

  const handleExportExcel = () => {
    exportSeatsToExcel({
      filteredSeats,
      teamLabel,
      sex,
      getEncontradoNombre,
      teamNumber: teamInfo?.teamNumber ?? undefined,
      captain,
      aux1,
      aux2,
      aux3,
    });
  };

  const handleExportBautizosExcel = () => {
    exportBautizosToExcel({
      filteredSeats,
      teamLabel,
      sex,
      getEncontradoNombre,
      teamNumber: teamInfo?.teamNumber ?? undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-seats-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-app-sidebar p-4 shadow-xl dark:border-gray-700 dark:bg-[#202124] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="team-seats-modal-title"
              className="text-base font-semibold text-app-text-primary dark:text-white sm:text-lg"
            >
              Asientos del {teamLabel}
            </h2>
            <p className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 sm:text-sm">
              Lista de todos los asientos para el género{" "}
              <span className="font-semibold">
                {sex === "H" ? "Hombres (H)" : "Mujeres (M)"}
              </span>{" "}
              y los encontrados asignados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-app-text-primary transition-colors hover:bg-app-selected dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:text-sm"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-gray-700 dark:bg-[#151515] sm:grid-cols-2 sm:gap-4 sm:p-4 sm:text-sm">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-app-text-secondary dark:text-gray-400 sm:text-xs">
              Capitán
            </label>
            <input
              type="text"
              value={captain}
              onChange={(e) => setCaptain(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-app-text-primary shadow-sm outline-none ring-0 transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted"
              placeholder="Nombre del capitán"
              disabled={saving || !teamInfo?.id}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-app-text-secondary dark:text-gray-400 sm:text-xs">
              Auxiliar 1
            </label>
            <input
              type="text"
              value={aux1}
              onChange={(e) => setAux1(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-app-text-primary shadow-sm outline-none ring-0 transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted"
              placeholder="Nombre del auxiliar 1"
              disabled={saving || !teamInfo?.id}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-app-text-secondary dark:text-gray-400 sm:text-xs">
              Auxiliar 2
            </label>
            <input
              type="text"
              value={aux2}
              onChange={(e) => setAux2(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-app-text-primary shadow-sm outline-none ring-0 transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted"
              placeholder="Nombre del auxiliar 2"
              disabled={saving || !teamInfo?.id}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-app-text-secondary dark:text-gray-400 sm:text-xs">
              Auxiliar 3
            </label>
            <input
              type="text"
              value={aux3}
              onChange={(e) => setAux3(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-app-text-primary shadow-sm outline-none ring-0 transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted"
              placeholder="Nombre del auxiliar 3"
              disabled={saving || !teamInfo?.id}
            />
          </div>
          <div className="col-span-full flex justify-end">
            <button
              type="button"
              onClick={handleSaveTeam}
              disabled={saving || !teamInfo?.id}
              className="inline-flex items-center rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90 sm:text-sm"
            >
              {saving ? "Guardando…" : "Guardar responsables"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleExportBautizosExcel}
            disabled={filteredSeats.length === 0}
            className="inline-flex items-center rounded-xl border border-green-500 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-sm transition-colors hover:bg-app-selected disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-[#151515] dark:text-gray-100 dark:hover:bg-gray-800 sm:text-sm"
          >
            Exportar bautizados
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredSeats.length === 0}
            className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-app-text-primary shadow-sm transition-colors hover:bg-app-selected disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-[#151515] dark:text-gray-100 dark:hover:bg-gray-800 sm:text-sm"
          >
            Exportar a Excel
          </button>
        </div>

        <div className="mt-2 max-h-[60vh] overflow-auto rounded-xl border border-gray-200 bg-white text-xs shadow-sm dark:border-gray-700 dark:bg-[#151515] sm:text-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-[#1e1e1e]">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Clave
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Encontrado
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Celular
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Medicamento
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Bautizo
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
                  Clave Antigua
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSeats.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-xs text-app-text-secondary dark:text-gray-400 sm:px-4 sm:text-sm"
                  >
                    No hay asientos para este género.
                  </td>
                </tr>
              ) : (
                filteredSeats.map((seat) => {
                  const tieneEncontrado = Boolean(seat.encontrado);

                  return (
                    <tr
                      key={seat.id}
                      className={
                        tieneEncontrado
                          ? "bg-emerald-50/80 dark:bg-emerald-900/10"
                          : "bg-transparent"
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-app-text-primary dark:text-gray-100 sm:px-4 sm:py-2.5 sm:text-sm">
                        {seat.encontrado?.sexo}
                        {teamInfo?.teamNumber}
                        {seat.letter}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-100 sm:px-4 sm:py-2.5 sm:text-xs">
                        {tieneEncontrado ? (
                          <span className="font-medium text-app-text-primary dark:text-white">
                            {getEncontradoNombre(seat)}
                          </span>
                        ) : (
                          <span className="italic text-gray-400 dark:text-gray-500">
                            Sin encontrado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-300 sm:px-4 sm:py-2.5 sm:text-xs text-center">
                        {seat.occupied ? "Ocupado" : "Libre"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-300 sm:px-4 sm:py-2.5 sm:text-xs text-center">
                        {seat.encontrado?.celular ? "✅" : "❌"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-300 sm:px-4 sm:py-2.5 sm:text-xs text-center">
                        {seat.encontrado?.medicamento ? "✅" : "❌"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-300 sm:px-4 sm:py-2.5 sm:text-xs text-center">
                        {seat.encontrado?.bautizo ? "✅" : "❌"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-[11px] text-app-text-secondary dark:text-gray-300 sm:px-4 sm:py-2.5 sm:text-xs text-center">
                        {seat.encontrado?.checkins?.claveOld ?? ""}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
