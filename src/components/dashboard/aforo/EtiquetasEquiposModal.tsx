"use client";

import type { Seat } from "registro/graphql/aforo/queries";
import { codigoEtiquetaEquipo, useExportEtiquetasEquiposPdf } from "./hooks";
import { SeleccionEquiposModal, SeleccionEquiposPanel } from "./SeleccionEquipos";

export interface EtiquetasEquiposModalProps {
  open: boolean;
  onClose: () => void;
  /** Asientos de Aforo (SEATS_QUERY), para saber qué equipos tienen ocupados. */
  seats: Seat[];
}

/**
 * "Etiquetas equipos": se eligen equipos (solo los que tienen asientos ocupados) y sexo, y se
 * descarga un PDF con una etiqueta tipo gafete por equipo y sexo, con solo su código ("H1").
 */
export function EtiquetasEquiposModal({ open, onClose, seats }: EtiquetasEquiposModalProps) {
  const { exportEtiquetasEquiposPdf, loading } = useExportEtiquetasEquiposPdf();
  return (
    <SeleccionEquiposModal
      open={open}
      onClose={onClose}
      title="Etiquetas de equipos"
      description="Elige equipos y descarga sus etiquetas en PDF, del tamaño del gafete: una por equipo y sexo con asientos ocupados."
    >
      {(teams) => (
        <SeleccionEquiposPanel
          teams={teams}
          seats={seats}
          armar={codigoEtiquetaEquipo}
          descargar={(codigos) =>
            exportEtiquetasEquiposPdf(
              codigos,
              `Etiquetas-equipos-${new Date().toISOString().slice(0, 10)}.pdf`,
            )
          }
          loading={loading}
          unidad={["etiqueta", "etiquetas"]}
          soloConOcupados
        />
      )}
    </SeleccionEquiposModal>
  );
}
