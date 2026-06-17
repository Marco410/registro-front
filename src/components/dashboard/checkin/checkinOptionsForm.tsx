"use client";

import {
  AccountSetting01Icon,
  CalendarIcon,
  CancelCircleIcon,
  ChurchIcon,
  SmartPhone01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Checkbox } from "registro/components/shared";
import { getFormSectionClass } from "registro/components/shared/FormInputStyles";
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

  const fullName = [
    selected?.nombre,
    selected?.apellido_p,
    selected?.apellido_m,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  return (
    <section
      className={getFormSectionClass(sexo, className)}
    >
      <div className="mb-6 flex w-full flex-row items-start justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
          Antes del check-in
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="-m-1 rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Cerrar"
        >
          <HugeiconsIcon icon={CancelCircleIcon} color="red" size={22} />
        </button>
      </div>

      {/* Nombre */}
      <p
        className={`mb-6 text-xl font-semibold leading-tight ${sexo === "M" ? "text-pink-600 dark:text-pink-400" : "text-app-primary dark:text-app-primary-muted"}`}
      >
        {fullName}
      </p>

      <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
          <HugeiconsIcon icon={CalendarIcon} size={18} className="shrink-0 opacity-70" />
          <span>{selected?.edad} años</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
          <HugeiconsIcon icon={AccountSetting01Icon} size={18} className="shrink-0 opacity-70" />
          <span>{selected?.estado_c || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
          <HugeiconsIcon icon={ChurchIcon} size={18} className="shrink-0 opacity-70" />
          <span>{selected?.religion || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-app-text-secondary dark:text-gray-400">
          <HugeiconsIcon icon={SmartPhone01Icon} size={18} className="shrink-0 opacity-70" />
          <span>{selected?.telefono || "N/A"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Contacto de emergencia */}
        <div className="border-t border-gray-200 py-4 dark:border-gray-700">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
            Contacto de emergencia
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-app-text-primary dark:text-gray-300">
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} size={16} className="shrink-0 opacity-70" />
              {selected?.nom_ref || "N/A"}
            </span>
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="shrink-0 opacity-70" />
              {selected?.tel_ref || "N/A"}
            </span>
          </div>
        </div>

        {/* Enfermedad / padecimiento */}
        <div className="border-t border-gray-200 py-4 dark:border-gray-700">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-500">
            Enfermedad / padecimiento
          </p>
          <p className="text-sm text-app-text-primary dark:text-gray-300">
            {selected?.enfermedad || "N/A"}
          </p>
        </div>
      </div>

      {/* Opciones celular / medicamento */}
      <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
        <p className="mb-4 text-xs text-app-text-secondary dark:text-gray-500">
          Indica si tiene celular o medicamento antes del check-in.
        </p>
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
      </div>
    </section>
  );
}
