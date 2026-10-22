"use client";

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChurchIcon, PrinterIcon } from "@hugeicons/core-free-icons";
import { Seat, type SeatEncontrado } from "registro/graphql/aforo/queries";
import { useExportBautizosExcel, useExportSeatsExcel, usePrintCertificate } from "./hooks";
import {
  ConfirmarBautizoModal,
  type BautizoAccion,
} from "./ConfirmarBautizoModal";
import { GlassModal } from "registro/components/shared/GlassModal";

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
  const [showConfirmBautizo, setShowConfirmBautizo] = useState(false);
  const [accionBautizo, setAccionBautizo] = useState<BautizoAccion>("aplicar");
  const [bautizoEncontrado, setBautizoEncontrado] =
    useState<SeatEncontrado | null>(null);
  const [printingCertificateId, setPrintingCertificateId] = useState<
    string | null
  >(null);

  const accentClass =
    sex === "H"
      ? "border-orange-500/40 text-orange-600 hover:bg-orange-500/10 focus:ring-orange-500/30 dark:border-orange-400/50 dark:text-orange-400 dark:hover:bg-orange-500/15"
 
      : "border-pink-500/40 text-pink-600 hover:bg-pink-500/10 focus:ring-pink-500/30 dark:border-pink-400/50 dark:text-pink-400 dark:hover:bg-pink-500/15";

  const [updateTeam, { loading: saving }] = useMutation(UPDATE_TEAM_MUTATION);
  const { exportSeatsToExcel } = useExportSeatsExcel();
  const { exportBautizosToExcel } = useExportBautizosExcel();
  const { PrintCertificate } = usePrintCertificate();

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

  const openBautizoModal = (encontrado: SeatEncontrado) => {
    setBautizoEncontrado(encontrado);
    setAccionBautizo(encontrado.bautizo ? "quitar" : "aplicar");
    setShowConfirmBautizo(true);
  };

  const handlePrintCertificate = async (encontrado: SeatEncontrado) => {
    setPrintingCertificateId(encontrado.id);
    try {
      await PrintCertificate(
        encontrado.nombre,
        encontrado.apellido_p,
        encontrado.apellido_m,
      );
    } finally {
      setPrintingCertificateId(null);
    }
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="team-seats-modal-title"
      panelClassName="max-h-[min(90vh,calc(100dvh-2rem))] max-w-5xl overflow-y-auto overscroll-contain p-4 sm:p-6"
      zIndex={50}
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
            className="inline-flex items-center rounded-xl border border-blue-500 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-sm transition-colors hover:bg-app-selected disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-[#151515] dark:text-gray-100 dark:hover:bg-gray-800 sm:text-sm"
          >
            Exportar certificados
          </button>
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
                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xs">
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
                    colSpan={7}
                    className="px-3 py-4 text-center text-xs text-app-text-secondary dark:text-gray-400 sm:px-4 sm:text-sm"
                  >
                    No hay asientos para este género.
                  </td>
                </tr>
              ) : (
                filteredSeats.map((seat) => {
                  const tieneEncontrado = Boolean(seat.encontrado);
                  const hasBautizo = Boolean(seat.encontrado?.bautizo);
                  const isPrintingCertificate =
                    printingCertificateId === seat.encontrado?.id;

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
                      <td className="whitespace-nowrap px-3 py-2 text-center sm:px-4 sm:py-2.5">
                        {tieneEncontrado && seat.encontrado ? (
                          hasBautizo ? (
                            <div className="inline-flex flex-col items-center gap-1 sm:flex-row">
                              <button
                                type="button"
                                onClick={() =>
                                  openBautizoModal(seat.encontrado!)
                                }
                                title="Quitar bautizo"
                                className="inline-flex items-center gap-1 rounded-lg border border-green-500/50 bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-700 transition-colors hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/30 dark:border-green-400/40 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25 sm:text-xs"
                              >
                                <HugeiconsIcon
                                  icon={ChurchIcon}
                                  size={14}
                                  className="shrink-0"
                                  aria-hidden
                                />
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handlePrintCertificate(seat.encontrado!)
                                }
                                disabled={isPrintingCertificate}
                                title="Imprimir certificado"
                                className="inline-flex items-center gap-1 rounded-lg border border-app-primary/40 bg-app-primary/10 px-2 py-1 text-[10px] font-semibold text-app-primary transition-colors hover:bg-app-primary/20 focus:outline-none focus:ring-2 focus:ring-app-primary/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-app-primary-muted/50 dark:bg-app-primary-muted/15 dark:text-app-primary-muted dark:hover:bg-app-primary-muted/25 sm:text-xs"
                              >
                                <HugeiconsIcon
                                  icon={PrinterIcon}
                                  size={14}
                                  className="shrink-0"
                                  aria-hidden
                                />
                                {isPrintingCertificate ? "…" : "Certificado"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openBautizoModal(seat.encontrado!)
                              }
                              title="Aplicar bautizo"
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 sm:text-xs ${accentClass}`}
                            >
                              <HugeiconsIcon
                                icon={ChurchIcon}
                                size={14}
                                className="shrink-0"
                                aria-hidden
                              />
                              No
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
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

      {showConfirmBautizo && (
        <ConfirmarBautizoModal
          open={showConfirmBautizo}
          accion={accionBautizo}
          encontrado={bautizoEncontrado}
          onSuccess={() => {
            setShowConfirmBautizo(false);
            setBautizoEncontrado(null);
          }}
          onCancel={() => {
            setShowConfirmBautizo(false);
            setBautizoEncontrado(null);
          }}
          zIndex={70}
        />
      )}
    </GlassModal>
  );
}
