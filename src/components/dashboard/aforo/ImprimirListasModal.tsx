"use client";

import type { Seat } from "registro/graphql/aforo/queries";
import { ImprimirListasPanel } from "./ImprimirListasPanel";
import { SeleccionEquiposModal } from "./SeleccionEquipos";

export interface ImprimirListasModalProps {
  open: boolean;
  onClose: () => void;
  /** Asientos de Aforo (SEATS_QUERY): ocupantes y responsables de cada equipo. */
  seats: Seat[];
}

/**
 * "Imprimir listas" desde "Más acciones" de Aforo: el mismo panel que la pestaña de
 * Gestionar equipos, pero para cualquier usuario (solo lee datos).
 */
export function ImprimirListasModal({ open, onClose, seats }: ImprimirListasModalProps) {
  return (
    <SeleccionEquiposModal
      open={open}
      onClose={onClose}
      title="Imprimir listas"
      description="Elige equipos y descarga sus listas en PDF tamaño carta: una hoja por lista, con dos copias para doblar a la mitad."
    >
      {(teams) => <ImprimirListasPanel teams={teams} seats={seats} />}
    </SeleccionEquiposModal>
  );
}
