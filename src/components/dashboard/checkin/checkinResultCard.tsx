"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PrinterIcon,
  SmartPhone01Icon,
  FirstAidKitIcon,
  CalendarIcon,
  AccountSetting01Icon,
  ChurchIcon,
} from "@hugeicons/core-free-icons";
import { usePrintGafete } from "./hooks/use-printer-gafete";
import { toast } from "sonner";

export interface CheckinResultData {
  clave: string;
  nombre: string;
  apellido_p: string;
  apellido_m?: string | null;
  sexo: "H" | "M";
  teamName?: string;
  seatLetter?: string;
  celular?: boolean;
  medicamento?: boolean;
  edad?: number | null;
  estado_c?: string | null;
  religion?: string | null;
  telefono?: string | null;
}

export interface CheckinResultCardProps {
  data: CheckinResultData;
  onPrint?: (copies: number) => void;
  className?: string;
}

/**
 * Copias por defecto: 1 base + 1 si tiene celular + 1 si tiene medicamento.
 */
function getDefaultCopies(data: CheckinResultData): number {
  return 1 + (data.celular ? 1 : 0) + (data.medicamento ? 1 : 0);
}

/**
 * Tarjeta con la clave final (sexo+teamNumber+letter), indicadores de celular/medicamento
 * y botón para imprimir gafete. Las copias por defecto incluyen +1 por celular y +1 por medicamento.
 */
export function CheckinResultCard({
  data,
  onPrint,
  className,
}: CheckinResultCardProps) {
  const defaultCopies = getDefaultCopies(data);
  const [copies, setCopies] = useState(defaultCopies);
  const printRef = useRef<HTMLDivElement>(null);
  const { PrintGafete, loading } = usePrintGafete();

  useEffect(() => {
    setCopies(getDefaultCopies(data));
  }, [data.celular, data.medicamento]);

  const isHombre = data.sexo === "H";
  const hasCelular = data.celular === true;
  const hasMedicamento = data.medicamento === true;
  const hasExtraFields =
    data.edad != null ||
    (data.estado_c != null && data.estado_c !== "") ||
    (data.religion != null && data.religion !== "") ||
    (data.telefono != null && data.telefono !== "");

  const cardClass = isHombre
    ? "border-app-primary bg-gradient-to-br from-app-primary/10 to-transparent dark:from-app-primary-muted/15"
    : "border-pink-500 bg-gradient-to-br from-pink-500/10 to-transparent dark:from-pink-500/15 dark:border-pink-400";

  const handlePrint = async () => {
    if (onPrint) {
      onPrint(copies);
      return;
    }
    try {
      await PrintGafete(data.nombre, data.clave, copies);
    } catch {
      toast.error("No se pudo abrir la impresión");
    }
  };

  const handlePrintRef = useRef(handlePrint);
  handlePrintRef.current = handlePrint;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlePrintRef.current?.();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 shadow-xl ${cardClass} ${className ?? ""}`.trim()}
    >
      <div className="p-6 sm:p-8">
        <div
          ref={printRef}
          className={`relative overflow-hidden rounded-2xl border-2 bg-white/95 px-6 py-5 shadow-lg dark:bg-gray-900/95 ${
            isHombre
              ? "border-app-primary/30"
              : "border-pink-500/30 dark:border-pink-400/30"
          }`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
                {data.nombre} {data.apellido_p} {data.apellido_m}
              </p>
              <p
                className={`mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl ${
                  isHombre
                    ? "text-app-primary"
                    : "text-pink-600 dark:text-pink-400"
                }`}
              >
                {data.clave}
              </p>
              {(data.teamName != null || data.seatLetter != null) && (
                <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
                  {data.teamName ?? ""}
                  {data.teamName != null && data.seatLetter != null && " · "}
                  {data.seatLetter != null ? `Asiento ${data.seatLetter}` : ""}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {hasCelular && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                      isHombre
                        ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                        : "bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-300"
                    }`}
                  >
                    <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
                    Celular
                  </span>
                )}
                {hasMedicamento && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                      isHombre
                        ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                        : "bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-300"
                    }`}
                  >
                    <HugeiconsIcon icon={FirstAidKitIcon} size={14} />
                    Medicamento
                  </span>
                )}
              </div>
            </div>

            {hasExtraFields && (
              <div
                className={`shrink-0 rounded-xl border px-4 py-3 sm:border-l sm:border-t-0 sm:border-r-0 sm:border-b-0 sm:pl-6 sm:pr-0 ${
                  isHombre
                    ? "border-app-primary/20 bg-app-primary/5 dark:border-app-primary-muted/20 dark:bg-app-primary-muted/5"
                    : "border-pink-500/20 bg-pink-500/5 dark:border-pink-400/20 dark:bg-pink-500/10"
                }`}
              >
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-app-text-secondary dark:text-gray-400">
                  Datos
                </p>
                <div className="grid min-w-[12rem] grid-cols-2 gap-x-6 gap-y-3 p-4">
                  {data.edad != null && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isHombre
                            ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                            : "bg-pink-500/15 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400"
                        }`}
                      >
                        <HugeiconsIcon icon={CalendarIcon} size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
                          Edad
                        </p>
                        <p className="text-sm font-medium text-app-text-primary dark:text-gray-200">
                          {data.edad} años
                        </p>
                      </div>
                    </div>
                  )}
                  {data.estado_c != null && data.estado_c !== "" && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isHombre
                            ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                            : "bg-pink-500/15 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400"
                        }`}
                      >
                        <HugeiconsIcon icon={AccountSetting01Icon} size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
                          Estado civil
                        </p>
                        <p className="truncate text-sm font-medium text-app-text-primary dark:text-gray-200">
                          {data.estado_c}
                        </p>
                      </div>
                    </div>
                  )}
                  {data.religion != null && data.religion !== "" && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isHombre
                            ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                            : "bg-pink-500/15 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400"
                        }`}
                      >
                        <HugeiconsIcon icon={ChurchIcon} size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
                          Religión
                        </p>
                        <p className="truncate text-sm font-medium text-app-text-primary dark:text-gray-200">
                          {data.religion}
                        </p>
                      </div>
                    </div>
                  )}
                  {data.telefono != null && data.telefono !== "" && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isHombre
                            ? "bg-app-primary/15 text-app-primary dark:bg-app-primary-muted/20"
                            : "bg-pink-500/15 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400"
                        }`}
                      >
                        <HugeiconsIcon icon={SmartPhone01Icon} size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
                          Teléfono
                        </p>
                        <p className="truncate text-sm font-medium font-mono text-app-text-primary dark:text-gray-200">
                          {data.telefono}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leyenda de copias y botón imprimir */}
        <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <label
              htmlFor="checkin-copies"
              className="text-sm font-medium text-app-text-primary dark:text-gray-300"
            >
              Copias
            </label>
            <input
              id="checkin-copies"
              type="number"
              min={1}
              max={99}
              value={copies}
              onChange={(e) =>
                setCopies(
                  Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)),
                )
              }
              className="w-18 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-center text-sm font-semibold transition-colors focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-app-primary-muted"
            />
            {(hasCelular || hasMedicamento) && (
              <span className="text-xs text-app-text-secondary dark:text-gray-500">
                (1 base
                {hasCelular && " +1 celular"}
                {hasMedicamento && " +1 medicamento"})
              </span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${
                isHombre
                  ? "bg-app-primary hover:bg-app-primary/90"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              <HugeiconsIcon icon={PrinterIcon} size={20} />
              {loading ? "Preparando…" : "Imprimir gafete"}
            </button>
            <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
                P
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
