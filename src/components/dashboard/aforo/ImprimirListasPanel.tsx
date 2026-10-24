"use client";

import type { EquipoGestion, Seat } from "registro/graphql/aforo/queries";
import { armarListaEquipo, useExportListaEquipoPdf } from "./hooks";
import { SeleccionEquiposPanel } from "./SeleccionEquipos";

export interface ImprimirListasPanelProps {
  /** Equipos en el orden del salón (desde el altar). */
  teams: EquipoGestion[];
  /** Asientos de SEATS_QUERY: traen ocupantes y responsables de cada equipo. */
  seats: Seat[];
}

/**
 * "Imprimir listas": se eligen equipos y sexo, y se descarga un solo PDF con una hoja carta
 * por lista (cada hoja con la lista dos veces, para doblar). Se usa en la pestaña de
 * Gestionar equipos y en el modal de "Más acciones".
 */
export function ImprimirListasPanel({ teams, seats }: ImprimirListasPanelProps) {
  const { exportListasEquiposPdf, loading } = useExportListaEquipoPdf();
  return (
    <SeleccionEquiposPanel
      teams={teams}
      seats={seats}
      armar={armarListaEquipo}
      descargar={(listas) =>
        exportListasEquiposPdf(
          listas,
          `Listas-equipos-${new Date().toISOString().slice(0, 10)}.pdf`,
        )
      }
      loading={loading}
      unidad={["hoja", "hojas"]}
    />
  );
}
