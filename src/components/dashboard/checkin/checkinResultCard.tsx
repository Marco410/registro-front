"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PrinterIcon } from "@hugeicons/core-free-icons";

export interface CheckinResultData {
  clave: string;
  nombre: string;
  sexo: "H" | "M";
  teamName?: string;
  seatLetter?: string;
}

export interface CheckinResultCardProps {
  data: CheckinResultData;
  onPrint?: (copies: number) => void;
  className?: string;
}

/**
 * Tarjeta con la clave final (sexo+teamNumber+letter) y botón para imprimir gafete.
 */
export function CheckinResultCard({
  data,
  onPrint,
  className,
}: CheckinResultCardProps) {
  const [copies, setCopies] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const isHombre = data.sexo === "H";
  const cardClass = isHombre
    ? "border-app-primary bg-app-primary/5 dark:bg-app-primary-muted/10"
    : "border-pink-500 bg-pink-500/5 dark:bg-pink-500/10 dark:border-pink-400";

  const handlePrint = () => {
    if (onPrint) {
      onPrint(copies);
      return;
    }
    // Fallback: imprimir el contenido del ref N veces (copias en el diálogo)
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Gafete - ${data.clave}</title></head>
      <body style="margin:0;padding:1rem;font-family:system-ui;">
        ${Array(copies).fill(`<div style="margin-bottom:1rem;">${content}</div>`).join("")}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-lg ${cardClass} ${className ?? ""}`.trim()}
    >
      <div ref={printRef} className="inline-block rounded-xl bg-white/90 p-4 dark:bg-gray-900/90">
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          {data.nombre}
        </p>
        <p
          className={`mt-1 text-3xl font-bold tracking-tight ${isHombre ? "text-app-primary" : "text-pink-600 dark:text-pink-400"}`}
        >
          {data.clave}
        </p>
        {data.teamName != null && (
          <p className="mt-0.5 text-xs text-app-text-secondary dark:text-gray-400">
            {data.teamName}
            {data.seatLetter != null ? ` · Asiento ${data.seatLetter}` : ""}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
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
              setCopies(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))
            }
            className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-center text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors ${isHombre ? "bg-app-primary hover:bg-app-primary/90" : "bg-pink-600 hover:bg-pink-700"}`}
        >
          <HugeiconsIcon icon={PrinterIcon} size={20} />
          Imprimir gafete
        </button>
      </div>
    </div>
  );
}
