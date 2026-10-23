"use client";

import type { FilaPorSexo } from "registro/lib/helpers/estadisticas";
import { SERIES, SinDatos } from "./chart-ui";

export interface EdadPiramideProps {
  filas: FilaPorSexo[];
}

/**
 * Pirámide de edades: hombres a la izquierda y mujeres a la derecha (como en el aforo),
 * con el rango al centro. Ambos lados usan la misma escala. Es una tabla: los valores
 * van escritos en los extremos y la barra solo da la proporción.
 */
export function EdadPiramide({ filas }: EdadPiramideProps) {
  const max = Math.max(0, ...filas.map((f) => Math.max(f.hombres, f.mujeres)));
  if (filas.every((f) => f.total === 0)) return <SinDatos />;
  const ancho = (n: number) => (max === 0 ? 0 : (n / max) * 100);

  return (
    <table className="w-full table-fixed text-sm">
      <caption className="sr-only">Personas por rango de edad y sexo</caption>
      <colgroup>
        <col className="w-10" />
        <col />
        <col className="w-24" />
        <col />
        <col className="w-10" />
      </colgroup>
      <thead>
        <tr className="text-[0.6875rem] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
          <th scope="col" className="pb-2 text-right">
            H
          </th>
          <th scope="col" className="pb-2 pr-2 text-right">
            Hombres
          </th>
          <th scope="col" className="pb-2 text-center">
            Edad
          </th>
          <th scope="col" className="pb-2 pl-2 text-left">
            Mujeres
          </th>
          <th scope="col" className="pb-2 text-left">
            M
          </th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr
            key={fila.nombre}
            className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
          >
            <td className="py-1.5 text-right tabular-nums text-app-text-secondary dark:text-gray-400">
              {fila.hombres.toLocaleString("es")}
            </td>
            <td className="py-1.5 pl-2 pr-[1px]">
              <div className="flex h-3 justify-end" aria-hidden>
                {fila.hombres > 0 ? (
                  <span
                    className={`min-w-[2px] rounded-l-[4px] ${SERIES.H.fill}`}
                    style={{ width: `${ancho(fila.hombres)}%` }}
                  />
                ) : null}
              </div>
            </td>
            <th
              scope="row"
              className="whitespace-nowrap px-2 py-1.5 text-center font-normal text-app-text-primary dark:text-gray-200"
            >
              {fila.nombre}
            </th>
            <td className="py-1.5 pl-[1px] pr-2">
              <div className="flex h-3" aria-hidden>
                {fila.mujeres > 0 ? (
                  <span
                    className={`min-w-[2px] rounded-r-[4px] ${SERIES.M.fill}`}
                    style={{ width: `${ancho(fila.mujeres)}%` }}
                  />
                ) : null}
              </div>
            </td>
            <td className="py-1.5 text-left tabular-nums text-app-text-secondary dark:text-gray-400">
              {fila.mujeres.toLocaleString("es")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
