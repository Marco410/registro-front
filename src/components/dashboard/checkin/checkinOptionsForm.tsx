"use client";

import {
  AccountSetting01Icon,
  ArrowLeft01Icon,
  CalendarIcon,
  CancelCircleIcon,
  ChurchIcon,
  SmartPhone01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Checkbox } from "registro/components/shared";
import { EncontradoListItem } from "registro/graphql/encontrados/queries";

export interface CheckinOptionsFormProps {
  selected: EncontradoListItem;
  sexo: "H" | "M";
  celular: boolean;
  medicamento: boolean;
  onCelularChange: (value: boolean) => void;
  onMedicamentoChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  onCancel: () => void;
}

/**
 * Formulario de opciones de check-in: ¿Tiene celular? ¿Tiene medicamento?
 */
export function CheckinOptionsForm({
  selected,
  sexo,
  celular,
  medicamento,
  onCelularChange,
  onMedicamentoChange,
  disabled,
  className,
  onCancel,
}: CheckinOptionsFormProps) {
  const borderClass =
    sexo === "M"
      ? "border-pink-500 dark:border-pink-400"
      : "border-app-primary dark:border-app-primary-muted";

  return (
    <section
      className={`rounded-2xl border-l-4 border-gray-200 bg-app-sidebar p-4 shadow-sm dark:border-gray-700 dark:bg-[#202124] ${borderClass} ${className ?? ""}`.trim()}
    >
      <div className="mb-3 flex w-full flex-row items-center justify-between">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
          Antes del check-in
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-app-text-secondary dark:text-gray-400"
        >
          <HugeiconsIcon icon={CancelCircleIcon} color="red" />
        </button>
      </div>
      <div className="mb-3 flex flex-col gap-5">
        <div className={`flex flex-col gap-3`}>
          <span
            className={`flex flex-row text-2xl font-semibold items-center gap-2 ${sexo === "M" ? "text-pink-500" : "text-app-primary"}`}
          >
            <HugeiconsIcon icon={UserIcon} /> {selected?.nombre.toUpperCase()}{" "}
            {selected?.apellido_p.toUpperCase()}{" "}
            {selected?.apellido_m.toUpperCase()}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
              <HugeiconsIcon icon={CalendarIcon} />
              {selected?.edad} años
            </span>
            <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
              <HugeiconsIcon icon={AccountSetting01Icon} />
              {selected?.estado_c || "N/A"}
            </span>
            <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
              <HugeiconsIcon icon={ChurchIcon} />
              {selected?.religion || "N/A"}
            </span>
            <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
              <HugeiconsIcon icon={SmartPhone01Icon} />{" "}
              {selected?.telefono || "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
              CONTACTO DE EMERGENCIA
            </h3>
            <div className="flex flex-row gap-2">
              <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
                <HugeiconsIcon icon={UserIcon} /> {selected?.nom_ref || "N/A"}
              </span>
              <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
                <HugeiconsIcon icon={SmartPhone01Icon} />{" "}
                {selected?.tel_ref || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
              ENFERMEDAD / PADECIMIENTO
            </h3>
            <span className="flex flex-row items-center gap-2 text-md text-app-text-secondary dark:text-gray-400">
              {selected?.enfermedad || "N/A"}
            </span>
          </div>
        </div>
        <p className="text-xs text-app-text-secondary dark:text-gray-400">
          Antes de hacer el check-in, indica si el encontrado tiene celular o
          medicamento.
        </p>
      </div>
      <div className="flex flex-wrap gap-6">
        <Checkbox
          sexo={sexo}
          label="¿Tiene celular?"
          checked={celular}
          onChange={(e) => onCelularChange(e.target.checked)}
          disabled={disabled}
        />
        <Checkbox
          sexo={sexo}
          label="¿Tiene medicamento?"
          checked={medicamento}
          onChange={(e) => onMedicamentoChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
    </section>
  );
}
