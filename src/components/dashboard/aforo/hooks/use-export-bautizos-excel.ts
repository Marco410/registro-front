"use client";

import type { Seat } from "registro/graphql/aforo/queries";

interface ExportParams {
  filteredSeats: Seat[];
  teamLabel: string;
  sex: "H" | "M";
  getEncontradoNombre: (seat: Seat) => string;
  teamNumber?: number;
}

export function useExportBautizosExcel() {
  const exportBautizosToExcel = ({
    filteredSeats,
    teamLabel,
    sex,
    getEncontradoNombre,
    teamNumber,
  }: ExportParams) => {
    if (!filteredSeats || filteredSeats.length === 0) return;

    const header = ["Nombre"];

    const rows = filteredSeats
      .filter((seat) => seat.encontrado?.bautizo)
      .map((seat) => {
        const tieneEncontrado = Boolean(seat.encontrado);
        const encontradoNombre = tieneEncontrado
          ? getEncontradoNombre(seat)
          : "";

        return [encontradoNombre];
      });

    const escapeCell = (value: unknown) => {
      const str = (value ?? "").toString().replace(/"/g, '""');
      return `"${str}"`;
    };

    const allRows = [header, ...rows];

    const csvContent = allRows
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sexoLabel = sex === "H" ? "H" : "M";
    link.href = url;
    link.setAttribute(
      "download",
      `Bautizados-Equipo-${teamNumber}-${sexoLabel}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportBautizosToExcel };
}
