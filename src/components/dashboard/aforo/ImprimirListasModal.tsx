"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  EQUIPOS_GESTION_QUERY,
  type EquiposGestionResponse,
  type Seat,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { ImprimirListasPanel } from "./ImprimirListasPanel";

export interface ImprimirListasModalProps {
  open: boolean;
  onClose: () => void;
  /** Asientos de Aforo (SEATS_QUERY): ocupantes y responsables de cada equipo. */
  seats: Seat[];
}

/**
 * "Imprimir listas" desde el encabezado de Aforo: el mismo panel que la pestaña de
 * Gestionar equipos, pero para cualquier usuario (solo lee datos).
 */
export function ImprimirListasModal({ open, onClose, seats }: ImprimirListasModalProps) {
  const { data, loading } = useQuery<EquiposGestionResponse>(EQUIPOS_GESTION_QUERY, {
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="imprimir-listas-title"
      panelClassName="flex max-h-[min(90vh,calc(100dvh-2rem))] max-w-2xl min-h-0 flex-col overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div>
          <h2
            id="imprimir-listas-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Imprimir listas
          </h2>
          <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
            Elige equipos y descarga sus listas en PDF tamaño carta: una hoja por lista, con
            dos copias para doblar a la mitad.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      {loading && !data ? (
        <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <ImprimirListasPanel teams={data?.teams ?? []} seats={seats} />
      )}
    </GlassModal>
  );
}
