"use client";

import type { Seat } from "registro/graphql/aforo/queries";

interface ExportParams {
  filteredSeats: Seat[];
  teamLabel: string;
  sex: "H" | "M";
  getEncontradoNombre: (seat: Seat) => string;
  teamNumber?: number;
  captain?: string;
  aux1?: string;
  aux2?: string;
  aux3?: string;
}

export function useExportSeatsExcel() {
  const exportSeatsToExcel = ({
    filteredSeats,
    teamLabel,
    sex,
    getEncontradoNombre,
    teamNumber,
    captain,
    aux1,
    aux2,
    aux3,
  }: ExportParams) => {
    if (!filteredSeats || filteredSeats.length === 0) return;

    const empty = "";
    const metaRows: (string | null)[][] = [
      [
        "Equipo",
        `${teamNumber ?? ""} de ${sex === "H" ? "Hombres" : "Mujeres"}`,
        ``,
        empty,
        empty,
      ],
      ["Capitán", captain ?? "", empty, empty, empty],
      ["Auxiliar 1", aux1 ?? "", empty, empty, empty],
      ["Auxiliar 2", aux2 ?? "", empty, empty, empty],
      ["Auxiliar 3", aux3 ?? "", empty, empty, empty],
      [empty, empty, empty, empty, empty],
    ];

    const header = [
      "Clave",
      "Encontrado",
      "Celular",
      "Medi",
      "Bautizo",
      "Observaciones",
    ];

    const rows = filteredSeats.map((seat) => {
      const tieneEncontrado = Boolean(seat.encontrado);
      const encontradoNombre = tieneEncontrado ? getEncontradoNombre(seat) : "";
      const clave = `${seat.encontrado?.sexo ?? ""}${teamNumber ?? ""}${seat.letter}`;
      const celular = seat.encontrado?.celular ? "Si" : "No";
      const medicamento = seat.encontrado?.medicamento ? "Si" : "No";
      const bautizo = "";

      return [clave, encontradoNombre, celular, medicamento, bautizo, empty];
    });

    const escapeCell = (value: unknown) => {
      const str = (value ?? "").toString().replace(/"/g, '""');
      return `"${str}"`;
    };

    const allRows = [...metaRows, header, ...rows];

    const csvContent = allRows
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTeam = teamLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const sexoLabel = sex === "H" ? "H" : "M";
    link.href = url;
    link.setAttribute("download", `Equipo-${teamNumber}-${sexoLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportSeatsToExcel };
}
