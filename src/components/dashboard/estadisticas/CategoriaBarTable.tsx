"use client";

import { porcentaje, type FilaPorSexo } from "registro/lib/helpers/estadisticas";
import { BarraHM, SinDatos } from "./chart-ui";

export interface CategoriaBarTableProps {
  filas: FilaPorSexo[];
  /** Personas de la población, para el porcentaje. */
  poblacion: number;
  /** Para lectores de pantalla, p. ej. "Estado civil por sexo". */
  caption: string;
}

/**
 * Tabla con barra apilada H/M por categoría. Es la gráfica y su vista de tabla a la
 * vez: cada valor (H, M, total, %) está escrito, la barra solo da la proporción.
 */
export function CategoriaBarTable({ filas, poblacion, caption }: CategoriaBarTableProps) {
  if (filas.length === 0) return <SinDatos />;
  const max = Math.max(...filas.map((f) => f.total));

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
          <th scope="col" className="pb-2 pr-3 text-left">
            Categoría
          </th>
          <th scope="col" className="w-full pb-2 pr-3">
            <span className="sr-only">Proporción</span>
          </th>
          <th scope="col" className="pb-2 pl-2 text-right">
            H
          </th>
          <th scope="col" className="pb-2 pl-2 text-right">
            M
          </th>
          <th scope="col" className="pb-2 pl-2 text-right">
            Total
          </th>
          <th scope="col" className="pb-2 pl-2 text-right">
            %
          </th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr
            key={fila.nombre}
            className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            title={`${fila.nombre}: ${fila.hombres} hombres, ${fila.mujeres} mujeres`}
          >
            <th
              scope="row"
              className="whitespace-nowrap py-1.5 pr-3 text-left font-normal text-app-text-primary dark:text-gray-200"
            >
              {fila.nombre}
            </th>
            <td className="py-1.5 pr-3">
              <BarraHM hombres={fila.hombres} mujeres={fila.mujeres} max={max} />
            </td>
            <td className="py-1.5 pl-2 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
              {fila.hombres.toLocaleString("es")}
            </td>
            <td className="py-1.5 pl-2 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
              {fila.mujeres.toLocaleString("es")}
            </td>
            <td className="py-1.5 pl-2 text-right font-semibold tabular-nums text-app-text-primary dark:text-white">
              {fila.total.toLocaleString("es")}
            </td>
            <td className="whitespace-nowrap py-1.5 pl-2 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
              {porcentaje(fila.total, poblacion)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
