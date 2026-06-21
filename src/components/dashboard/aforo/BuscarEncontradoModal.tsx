"use client";

import { useEffect, useState } from "react";
import { CheckinEncontradoSelector, CheckinOptionsForm, CheckinPrintControls } from "registro/components/dashboard/checkin";
import type { EncontradoListItem } from "registro/graphql/encontrados/queries";
import { GlassModal } from "registro/components/shared/GlassModal";
import { getStoredSexo, REGISTRO_SEXO_KEY } from "registro/constants/const";
import { useAuth } from "registro/hooks/use-auth";
import { AnimatedMount } from "registro/components/shared";

function buildGafeteClave(encontrado: EncontradoListItem): string {
  const sexo = encontrado.sexo === "M" ? "M" : "H";
  const teamNumber = encontrado.checkins?.team?.teamNumber;
  const seatLetter = encontrado.checkins?.seat?.letter;
  const num = teamNumber != null ? String(teamNumber) : "";
  const letter = seatLetter ?? "";
  return `${sexo}${num}${letter}`.trim();
}

export interface BuscarEncontradoModalProps {
  open: boolean;
  onClose: () => void;
}

export function BuscarEncontradoModal({ open, onClose }: BuscarEncontradoModalProps) {
  const { user } = useAuth();
  const userId = user?.id != null ? String(user.id) : "";
  const [selected, setSelected] = useState<EncontradoListItem | null>(null);
  const [sexoFilter, setSexoFilter] = useState<"H" | "M" | null>(() =>
    getStoredSexo(),
  );

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setSexoFilter(getStoredSexo());
    }
  }, [open]);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="buscar-encontrado-modal-title"
      panelClassName="flex max-h-[min(90vh,calc(100dvh-2rem))] max-w-4xl min-h-0 w-full flex-col overflow-hidden"
    >
      <div className="shrink-0 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <h2
          id="buscar-encontrado-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Buscar encontrado
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <CheckinEncontradoSelector
          userId={userId}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          sexo={sexoFilter ?? "H"}
          sexoFilter={sexoFilter}
          autoFocusSearch={open}
          onSexoFilterChange={(value) => {
            window.localStorage.setItem(REGISTRO_SEXO_KEY, value);
            setSexoFilter(value);
          }}
        />
      </div>

      {
        selected && (
          <div className="p-4">
            <AnimatedMount
              show={true}
              animationKey={selected.id}
            >
            <CheckinOptionsForm
              selected={selected}
              sexo={selected.sexo === "M" ? "M" : "H"}
              celular={selected.celular ?? true}
              medicamento={selected.medicamento ?? false}
              onCelularChange={() => {}}
              onMedicamentoChange={() => {}}
              disabled={false}
              onCancel={() => { setSelected(null); }}
            />
              <CheckinPrintControls
                className="mt-6"
                sexo={selected.sexo === "M" ? "M" : "H"}
                hasCelular={selected.celular ?? true}
                hasMedicamento={selected.medicamento ?? false}
                printData={{
                  clave: buildGafeteClave(selected),
                  nombre: selected.nombre,
                  apellido_p: selected.apellido_p,
                  apellido_m: selected.apellido_m,
                }}
                copiesInputId="buscar-encontrado-copies"
              />
          </AnimatedMount>
          </div>
        )
      }
    </GlassModal>
  );
}
