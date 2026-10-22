"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PrinterIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { usePrintGafete } from "./hooks/use-printer-gafete";

export interface CheckinPrintData {
  clave: string;
  nombre: string;
  apellido_p: string;
  apellido_m?: string | null;
}

export interface CheckinPrintControlsProps {
  sexo: "H" | "M";
  hasCelular: boolean;
  hasMedicamento: boolean;
  printData: CheckinPrintData;
  /** Si se define, reemplaza la impresión por defecto del gafete. */
  onPrint?: (copies: number) => void;
  copiesInputId?: string;
  className?: string;
  /** Pausa el atajo Ctrl+P (p. ej. mientras hay un modal abierto encima). */
  shortcutDisabled?: boolean;
}

function getDefaultCopies(hasCelular: boolean, hasMedicamento: boolean): number {
  return 2 + (hasCelular ? 1 : 0) + (hasMedicamento ? 1 : 0);
}

export function CheckinPrintControls({
  sexo,
  hasCelular,
  hasMedicamento,
  printData,
  onPrint,
  copiesInputId = "checkin-copies",
  className,
  shortcutDisabled = false,
}: CheckinPrintControlsProps) {
  const defaultCopies = getDefaultCopies(hasCelular, hasMedicamento);
  const [copies, setCopies] = useState(defaultCopies);
  const { PrintGafete, loading } = usePrintGafete();
  const isHombre = sexo === "H";

  useEffect(() => {
    setCopies(defaultCopies);
  }, [defaultCopies]);

  const handlePrint = useCallback(async () => {
    if (onPrint) {
      onPrint(copies);
      return;
    }
    try {
      await PrintGafete(
        printData.nombre,
        printData.clave,
        printData.apellido_p,
        printData.apellido_m,
        copies,
      );
    } catch {
      toast.error("No se pudo abrir la impresión");
    }
  }, [copies, onPrint, printData, PrintGafete]);

  const handlePrintRef = useRef(handlePrint);
  handlePrintRef.current = handlePrint;
  const shortcutDisabledRef = useRef(shortcutDisabled);
  shortcutDisabledRef.current = shortcutDisabled;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (shortcutDisabledRef.current) return;
      if ((e.key === "p" || e.key === "P") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void handlePrintRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return (
    <div
      className={`flex flex-wrap items-center gap-4 sm:gap-6 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <label
          htmlFor={copiesInputId}
          className="text-sm font-medium text-app-text-primary dark:text-gray-300"
        >
          Copias
        </label>
        <input
          id={copiesInputId}
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
          onClick={() => void handlePrint()}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${
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
  );
}
