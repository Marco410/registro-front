"use client";

import type { Seat } from "registro/graphql/aforo/queries";

function getNombre(seat: Seat): string {
  return seat.encontrado?.nombre?.trim() ?? "";
}

function getApellidoP(seat: Seat): string {
  return seat.encontrado?.apellido_p?.trim() ?? "";
}

function getApellidoM(seat: Seat): string {
  return seat.encontrado?.apellido_m?.trim() ?? "";
}

function getTelefono(seat: Seat): string {
  return seat.encontrado?.telefono ?? "";
}

function getFechaNacimiento(seat: Seat): string {
  return seat.encontrado?.fecha_n ?? "";
}

function getContactoEmergenciaNombre(seat: Seat): string {
  return seat.encontrado?.nom_ref ?? "";
}

function getContactoEmergenciaTelefono(seat: Seat): string {
  return seat.encontrado?.tel_ref ?? "";
}

function getCapitan(seat: Seat): string {
  const team = seat.team;
  if (!team) return "";
  const sexo = seat.encontrado?.sexo ?? seat.gender ?? "";
  return sexo === "H" ? (team.captain_h ?? "") : (team.captain ?? "");
}

function getEquipo(seat: Seat): string {
  const sexo = seat.encontrado?.sexo ?? seat.gender ?? "";
  return sexo === "M"
    ? `M${seat.team?.teamName ?? ""}`
    : `H${seat.team?.teamName ?? ""}`;
}

/**
 * Exporta a CSV todos los encontrados con asiento asignado, excepto los dados de baja.
 * Columnas: Nombre, Apellido paterno, Apellido materno, Fecha de nacimiento, Teléfono, Equipo, Capitán, Contacto emergencia (nombre), Teléfono contacto emergencia.
 */
export function useExportEncontradosExcel() {
  const exportEncontradosToExcel = (seats: Seat[]) => {
    const filtered = (seats ?? []).filter(
      // Solo quien ocupa el asiento: al dar de baja queda `occupied: false` (aunque el
      // encontrado siga conectado) y si alguien más lo ocupa después, ese sí sale.
      (seat) => Boolean(seat.encontrado) && seat.occupied,
    );
    if (filtered.length === 0) return;

    const header = [
      "Nombre",
      "Apellido paterno",
      "Apellido materno",
      "Fecha de nacimiento",
      "Teléfono",
      "Equipo",
      "Capitán",
      "Contacto emergencia (nombre)",
      "Teléfono contacto emergencia",
    ];

    const rows = filtered.map((seat) => [
      getNombre(seat),
      getApellidoP(seat),
      getApellidoM(seat),
      getFechaNacimiento(seat),
      getTelefono(seat),
      getEquipo(seat),
      getCapitan(seat),
      getContactoEmergenciaNombre(seat),
      getContactoEmergenciaTelefono(seat),
    ]);

    const escapeCell = (value: unknown) => {
      const str = (value ?? "").toString().replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [header, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Encontrados-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportEncontradosToExcel };
}
