"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  ChurchIcon,
  ClipboardIcon,
  Clock01Icon,
  FirstAidKitIcon,
  Logout01Icon,
  SeatSelectorIcon,
  SmartPhone01Icon,
  StethoscopeIcon,
} from "@hugeicons/core-free-icons";
import {
  ESTADISTICAS_QUERY,
  type EstadisticasQueryResponse,
} from "registro/graphql/estadisticas/queries";
import {
  ESTADO_CIVIL_OPCIONES,
  RELIGION_OPCIONES,
  acumuladoPorIntervalo,
  actividadPorHora,
  estaEnRetiro,
  idsDeBajas,
  indicadores,
  porCategoria,
  porEdad,
  resumenEvento,
  type Poblacion,
} from "registro/lib/helpers/estadisticas";
import { ConteoStat } from "registro/components/dashboard/aforo/ConteoStat";
import { ActividadPorHora } from "./ActividadPorHora";
import { CategoriaBarTable } from "./CategoriaBarTable";
import { CrecimientoAcumulado } from "./CrecimientoAcumulado";
import { ChartCard, Leyenda } from "./chart-ui";
import { EdadPiramide } from "./EdadPiramide";
import { IndicadoresMeters } from "./IndicadoresMeters";

/** Cada cuánto se refrescan los datos (ms). */
const POLL_MS = 30_000;

const POBLACIONES: { value: Poblacion; label: string }[] = [
  { value: "retiro", label: "En el retiro" },
  { value: "registrados", label: "Todos los registrados" },
];

/**
 * Estadísticas del evento. Una sola consulta alimenta todo: el resumen (registrados,
 * en el retiro, sin check-in, bajas) y las gráficas, que se calculan sobre la
 * población elegida en el filtro de arriba.
 */
export function EstadisticasDashboard() {
  const [poblacion, setPoblacion] = useState<Poblacion>("retiro");
  const { data, loading, error } = useQuery<EstadisticasQueryResponse>(
    ESTADISTICAS_QUERY,
    { pollInterval: POLL_MS },
  );

  const encontrados = useMemo(() => data?.encontrados ?? [], [data]);
  const bajaIds = useMemo(() => idsDeBajas(data?.bajas ?? []), [data]);
  const resumen = useMemo(
    () => resumenEvento(encontrados, bajaIds),
    [encontrados, bajaIds],
  );
  const lista = useMemo(
    () =>
      poblacion === "retiro"
        ? encontrados.filter((e) => estaEnRetiro(e, bajaIds))
        : encontrados,
    [encontrados, bajaIds, poblacion],
  );

  const edad = useMemo(() => porEdad(lista), [lista]);
  const estadoCivil = useMemo(
    () => porCategoria(lista, (e) => e.estado_c, ESTADO_CIVIL_OPCIONES, "Otro"),
    [lista],
  );
  const religion = useMemo(
    () => porCategoria(lista, (e) => e.religion, RELIGION_OPCIONES, "Otra"),
    [lista],
  );
  const extra = useMemo(() => indicadores(lista), [lista]);
  const actividad = useMemo(() => actividadPorHora(lista), [lista]);
  const crecimiento = useMemo(() => acumuladoPorIntervalo(lista), [lista]);

  if (loading && !data) {
    return (
      <div className="space-y-6" aria-hidden>
        <div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudieron cargar las estadísticas: {error.message}
      </p>
    );
  }

  const total = lista.length;
  const { promedio, sinEdad } = edad;

  return (
    <div className="space-y-6">
      <section
        aria-label="Resumen del evento"
        className="flex flex-col divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-[#202124] sm:flex-row sm:divide-x sm:divide-y-0"
      >
        <ConteoStat label="Registrados" icon={ClipboardIcon} conteo={resumen.registrados} />
        <ConteoStat label="En el retiro" icon={SeatSelectorIcon} conteo={resumen.enRetiro} />
        <ConteoStat label="Sin check-in" icon={Clock01Icon} conteo={resumen.sinCheckin} />
        <ConteoStat
          label="Bajas"
          icon={Logout01Icon}
          conteo={resumen.bajas}
          totalClassName={
            resumen.bajas.total > 0
              ? "text-red-600 dark:text-red-400"
              : "text-app-text-primary dark:text-white"
          }
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-app-text-primary dark:text-gray-200">
          Gráficas de
        </span>
        <div
          role="radiogroup"
          aria-label="Población de las gráficas"
          className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
        >
          {POBLACIONES.map((p) => {
            const active = p.value === poblacion;
            const n =
              p.value === "retiro" ? resumen.enRetiro.total : resumen.registrados.total;
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPoblacion(p.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 ${
                  active
                    ? "bg-white text-app-text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-app-text-secondary hover:text-app-text-primary dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {p.label}{" "}
                <span className="tabular-nums text-app-text-secondary dark:text-gray-400">
                  {n.toLocaleString("es")}
                </span>
              </button>
            );
          })}
        </div>
        {error ? (
          <span className="text-xs text-red-600 dark:text-red-400">
            No se pudo actualizar; se muestran los últimos datos.
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Edad"
          subtitle={
            promedio.total != null
              ? `Promedio: ${promedio.total} años (H ${promedio.hombres ?? "—"} · M ${promedio.mujeres ?? "—"})${
                  sinEdad > 0 ? ` · ${sinEdad} sin edad registrada` : ""
                }`
              : "Sin edades registradas."
          }
          aside={<Leyenda series={["H", "M"]} />}
        >
          <EdadPiramide filas={edad.filas} />
        </ChartCard>

        <ChartCard
          title="Salud y pertenencias"
          subtitle="Proporción de la población; útil para preparar medicamentos y guardar celulares."
        >
          <IndicadoresMeters
            poblacion={total}
            items={[
              { label: "Con celular", icon: SmartPhone01Icon, conteo: extra.celular },
              { label: "Con medicamento", icon: FirstAidKitIcon, conteo: extra.medicamento },
              {
                label: "Con enfermedad o padecimiento",
                icon: StethoscopeIcon,
                conteo: extra.padecimiento,
              },
              { label: "Bautizados", icon: ChurchIcon, conteo: extra.bautizados },
            ]}
          />
        </ChartCard>

        <ChartCard title="Estado civil" aside={<Leyenda series={["H", "M"]} />}>
          <CategoriaBarTable
            filas={estadoCivil}
            poblacion={total}
            caption="Estado civil por sexo"
          />
        </ChartCard>

        <ChartCard title="Religión" aside={<Leyenda series={["H", "M"]} />}>
          <CategoriaBarTable
            filas={religion}
            poblacion={total}
            caption="Religión por sexo"
          />
        </ChartCard>
      </div>

      <ActividadPorHora cubetas={actividad.cubetas} recortado={actividad.recortado} />

      <CrecimientoAcumulado
        puntos={crecimiento.puntos}
        recortado={crecimiento.recortado}
      />
    </div>
  );
}
