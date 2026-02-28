"use client";

import { useLazyQuery } from "@apollo/client";
import { toast } from "sonner";
import {
  BAUTIZO_LISTA_QUERY,
  type BautizoListaResponse,
  type BautizoListaForaneoItem,
} from "registro/graphql/aforo/queries";

const BAUTIZO_LISTA_VARIABLES = {
  where: {
    encontrado: {
      bautizo: { equals: true },
    },
  },
};

function fullName(
  nombre: string,
  apellido_p: string | null,
  apellido_m: string | null,
): string {
  return [nombre, apellido_p, apellido_m].filter(Boolean).join(" ").trim();
}

export function useExportListaBautizos() {
  const [fetchLista, { loading }] = useLazyQuery<BautizoListaResponse>(
    BAUTIZO_LISTA_QUERY,
    {
      variables: BAUTIZO_LISTA_VARIABLES,
      onCompleted: (data) => {
        const header = ["Clave", "Nombre"];
        const rows: [string, string][] = [];

        data.checkins.forEach((c) => {
          const e = c.encontrado;
          const nombre = fullName(
            e.nombre,
            e.apellido_p ?? null,
            e.apellido_m ?? null,
          );
          rows.push([c.clave, nombre]);
        });

        data.bautizoForaneos.forEach((f: BautizoListaForaneoItem) => {
          const nombre = fullName(f.nombre, f.apellido_p, f.apellido_m);
          rows.push(["zForáneo", nombre]);
        });

        const escapeCell = (value: unknown) => {
          const str = (value ?? "").toString().replace(/"/g, '""');
          return `"${str}"`;
        };
        const csvContent = [header, ...rows]
          .map((row) => row.map(escapeCell).join(","))
          .join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Lista-bautizados.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Lista exportada");
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al exportar la lista");
      },
    },
  );

  const exportLista = () => fetchLista();

  return { exportLista, loading };
}
