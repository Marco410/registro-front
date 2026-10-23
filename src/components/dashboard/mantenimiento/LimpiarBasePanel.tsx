"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import type { MantenimientoQueryResponse } from "registro/graphql/mantenimiento/queries";
import type { CleanDatabaseOptions } from "registro/graphql/mantenimiento/mutations";
import { useCleanDatabase } from "./hooks";

/** Palabra que hay que escribir para habilitar la limpieza. */
const CONFIRM_WORD = "LIMPIAR";

type OptionKey = keyof CleanDatabaseOptions;

const NOTHING_SELECTED: CleanDatabaseOptions = {
  checkins: false,
  encontrados: false,
  teams: false,
  bautizos: false,
  auditLogs: false,
};

const OPTION_ORDER: OptionKey[] = [
  "checkins",
  "encontrados",
  "teams",
  "bautizos",
  "auditLogs",
];

function getOptionInfo(
  key: OptionKey,
  data: MantenimientoQueryResponse | undefined,
): { title: string; detail: string; description: string } {
  const n = (value: number | undefined) => (value ?? 0).toLocaleString("es");
  switch (key) {
    case "checkins":
      return {
        title: "Check-ins",
        detail: `${n(data?.checkinsCount)} check-ins · ${n(data?.seatsUsadosCount)} asientos ocupados o con baja`,
        description:
          "Libera todos los asientos y quita las bajas. Los encontrados siguen registrados, sin asiento.",
      };
    case "encontrados":
      return {
        title: "Registros de encontrados",
        detail: `${n(data?.encontradosCount)} encontrados`,
        description: "Borra a las personas registradas. Incluye sus check-ins.",
      };
    case "teams":
      return {
        title: "Equipos y asientos",
        detail: `${n(data?.teamsCount)} equipos · ${n(data?.seatsCount)} asientos`,
        description:
          "Incluye los check-ins. Los grupos de edad se quedan para volver a generar equipos.",
      };
    case "bautizos":
      return {
        title: "Bautizos",
        detail: `${n(data?.bautizoForaneosCount)} foráneos · ${n(data?.encontradosBautizadosCount)} encontrados bautizados`,
        description:
          "Borra los bautizos foráneos y quita la marca de bautizo a los encontrados.",
      };
    case "auditLogs":
      return {
        title: "Bitácora de auditoría",
        detail: `${n(data?.auditLogsCount)} entradas`,
        description: "Solo queda la entrada de esta limpieza.",
      };
  }
}

export interface LimpiarBasePanelProps {
  data: MantenimientoQueryResponse | undefined;
  loading: boolean;
}

/**
 * Limpia la base para empezar otro evento: check-ins, encontrados, equipos, bautizos y/o
 * la bitácora. Borrar encontrados o equipos incluye los check-ins (el backend hace lo
 * mismo). Hay que escribir LIMPIAR para habilitar el botón. Usuarios, roles, eventos y
 * grupos de edad no se tocan.
 */
export function LimpiarBasePanel({ data, loading }: LimpiarBasePanelProps) {
  const [selected, setSelected] = useState<CleanDatabaseOptions>(NOTHING_SELECTED);
  const [confirmText, setConfirmText] = useState("");
  const { cleanDatabase, loading: cleaning } = useCleanDatabase();

  const checkinsForzados = selected.encontrados || selected.teams;
  const effective: CleanDatabaseOptions = {
    ...selected,
    checkins: selected.checkins || checkinsForzados,
  };
  const elegidas = OPTION_ORDER.filter((key) => effective[key]);
  const confirmed = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const toggle = (key: OptionKey) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleClean = async () => {
    if (!confirmed || elegidas.length === 0) return;
    const ok = await cleanDatabase(effective);
    if (ok) {
      setSelected(NOTHING_SELECTED);
      setConfirmText("");
    }
  };

  return (
    <section
      aria-labelledby="limpiar-base-title"
      className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]"
    >
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h2
          id="limpiar-base-title"
          className="text-base font-semibold text-app-text-primary dark:text-white"
        >
          Limpiar base de datos
        </h2>
        <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
          Para empezar otro evento. No se borran usuarios, roles, eventos ni
          grupos de edad. No se puede deshacer.
        </p>
      </div>

      <fieldset className="space-y-2 px-5 py-4" disabled={cleaning || loading}>
        <legend className="sr-only">Qué limpiar</legend>
        {OPTION_ORDER.map((key) => {
          const info = getOptionInfo(key, data);
          const forced = key === "checkins" && checkinsForzados;
          const checked = effective[key];
          const inputId = `limpiar-${key}`;
          return (
            <label
              key={key}
              htmlFor={inputId}
              className={`flex cursor-pointer gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                checked
                  ? "border-red-300 bg-red-50/70 dark:border-red-500/40 dark:bg-red-500/10"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.03]"
              } ${forced ? "cursor-default" : ""}`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                disabled={forced}
                onChange={() => toggle(key)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-app-text-primary dark:text-gray-100">
                    {info.title}
                  </span>
                  <span className="text-xs tabular-nums text-app-text-secondary dark:text-gray-400">
                    {loading ? "…" : info.detail}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-app-text-secondary dark:text-gray-400">
                  {forced
                    ? "Se incluye porque borras encontrados o equipos."
                    : info.description}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="space-y-3 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
        {elegidas.length > 0 ? (
          <p className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <HugeiconsIcon icon={Alert02Icon} size={16} className="mt-0.5 shrink-0" />
            <span>
              Se borrará:{" "}
              {elegidas.map((key) => getOptionInfo(key, data).title.toLowerCase()).join(", ")}
              .
            </span>
          </p>
        ) : (
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            Elige qué quieres limpiar.
          </p>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <label
              htmlFor="limpiar-confirmacion"
              className="mb-1 block text-xs font-medium text-app-text-secondary dark:text-gray-400"
            >
              Escribe <span className="font-mono font-semibold">{CONFIRM_WORD}</span>{" "}
              para confirmar
            </label>
            <input
              id="limpiar-confirmacion"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={elegidas.length === 0 || cleaning}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm uppercase text-app-text-primary shadow-sm outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleClean()}
            disabled={!confirmed || elegidas.length === 0 || cleaning}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            {cleaning ? "Limpiando…" : "Limpiar base de datos"}
          </button>
        </div>
      </div>
    </section>
  );
}
