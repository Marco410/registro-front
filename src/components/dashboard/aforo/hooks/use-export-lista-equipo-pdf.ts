"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { jsPDF as JsPDF } from "jspdf";
import type { Seat } from "registro/graphql/aforo/queries";
import { RESPONSABLES, getSeatSex, sortSeatsByLetter } from "../seat-utils";

/** Hoja carta horizontal en mm. Cada copia de la lista ocupa una mitad. */
const HOJA_ANCHO = 279.4;
const HOJA_ALTO = 215.9;
const MITAD = HOJA_ANCHO / 2;
const MARGEN = 9;
const ANCHO_LISTA = MITAD - MARGEN * 2;

type Alineacion = "left" | "center";

/** Columnas de la tabla; "Encontrado" toma el ancho que sobra. */
const COLUMNAS: { titulo: string; ancho: number; align: Alineacion }[] = [
  { titulo: "Clave", ancho: 13, align: "center" },
  { titulo: "Encontrado", ancho: 0, align: "left" },
  { titulo: "Celular", ancho: 13, align: "center" },
  { titulo: "Medi", ancho: 10, align: "center" },
  { titulo: "Bautizo", ancho: 14, align: "center" },
  { titulo: "Clave ant.", ancho: 16, align: "center" },
];
const ANCHOS = COLUMNAS.map((c) =>
  c.ancho > 0 ? c.ancho : ANCHO_LISTA - COLUMNAS.reduce((s, x) => s + x.ancho, 0),
);

type RGB = [number, number, number];
const TEXTO: RGB = [17, 24, 39];
const TEXTO_SUAVE: RGB = [107, 114, 128];
const BORDE: RGB = [209, 213, 219];
const FONDO_ETIQUETA: RGB = [229, 231, 235];
const FONDO_ALTERNO: RGB = [243, 244, 246];
const FONDO_ENCABEZADO: RGB = [55, 65, 81];

export interface ListaEquipoPdfParams {
  /** Asientos del sexo, ordenados por letra. */
  seats: Seat[];
  /** "Equipo 1 (31-40)". */
  teamLabel: string;
  sex: "H" | "M";
  teamNumber?: number;
  /** Capitán y auxiliares, en orden. */
  responsables: { label: string; nombre: string }[];
}

/**
 * Datos de la lista de un equipo para un sexo, a partir de sus asientos de `SEATS_QUERY`
 * (traen el equipo y sus responsables). null si el equipo no tiene asientos de ese sexo.
 */
export function armarListaEquipo(
  seatsDelEquipo: Seat[],
  sex: "H" | "M",
): ListaEquipoPdfParams | null {
  const seats = sortSeatsByLetter(seatsDelEquipo.filter((s) => getSeatSex(s) === sex));
  const team = seats[0]?.team;
  if (!team) return null;
  const grupo = team.ageGroup?.label;
  return {
    seats,
    teamLabel: grupo ? `${team.teamName} (${grupo})` : team.teamName,
    sex,
    teamNumber: team.teamNumber,
    responsables: RESPONSABLES.map((r) => ({
      label: r.label,
      nombre: (team[r.field[sex]] ?? "").trim(),
    })),
  };
}

/** Escribe `texto` en la celda; si no cabe, achica la letra hasta 6.5 pt y luego lo corta con "…". */
function textoEnCelda(
  doc: JsPDF,
  texto: string,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  align: Alineacion,
  tamano: number,
) {
  if (!texto) return;
  const disponible = ancho - 3;
  let size = tamano;
  doc.setFontSize(size);
  while (doc.getTextWidth(texto) > disponible && size > 6.5) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  let final = texto;
  if (doc.getTextWidth(final) > disponible) {
    while (final.length > 1 && doc.getTextWidth(`${final}…`) > disponible) {
      final = final.slice(0, -1);
    }
    final = `${final.trimEnd()}…`;
  }
  const tx = align === "center" ? x + ancho / 2 : x + 1.5;
  doc.text(final, tx, y + alto / 2, { align, baseline: "middle" });
  doc.setFontSize(tamano);
}

/**
 * Tamaño de letra (de `tamano` hacia abajo, mínimo `minimo`) en el que caben todos los
 * textos, para que la columna se vea pareja; el que aún no quepa se achica o se corta solo.
 */
function tamanoQueCabe(
  doc: JsPDF,
  textos: string[],
  ancho: number,
  tamano: number,
  minimo = 7.5,
): number {
  let size = tamano;
  doc.setFontSize(size);
  const masAncho = () => Math.max(0, ...textos.map((t) => doc.getTextWidth(t)));
  while (masAncho() > ancho - 3 && size > minimo) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

/** Dibuja una copia de la lista con su esquina superior izquierda en `x0`. */
function dibujarLista(doc: JsPDF, x0: number, p: ListaEquipoPdfParams, impreso: string) {
  const sexoLabel = p.sex === "H" ? "Hombres" : "Mujeres";
  let y = MARGEN;

  doc.setTextColor(...TEXTO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${p.teamLabel} · ${sexoLabel}`, x0, y + 4, { baseline: "middle" });
  y += 10;

  // Capitán y auxiliares
  const altoMeta = 6.2;
  const anchoEtiqueta = 26;
  doc.setLineWidth(0.2);
  doc.setDrawColor(...BORDE);
  for (const r of p.responsables) {
    doc.setFillColor(...FONDO_ETIQUETA);
    doc.rect(x0, y, anchoEtiqueta, altoMeta, "FD");
    doc.rect(x0 + anchoEtiqueta, y, ANCHO_LISTA - anchoEtiqueta, altoMeta, "S");
    doc.setFont("helvetica", "bold");
    textoEnCelda(doc, r.label, x0, y, anchoEtiqueta, altoMeta, "left", 9);
    doc.setFont("helvetica", "normal");
    textoEnCelda(
      doc,
      r.nombre,
      x0 + anchoEtiqueta,
      y,
      ANCHO_LISTA - anchoEtiqueta,
      altoMeta,
      "left",
      9.5,
    );
    y += altoMeta;
  }
  y += 4;

  // Encabezado de la tabla
  const altoEncabezado = 7;
  let x = x0;
  doc.setFillColor(...FONDO_ENCABEZADO);
  doc.rect(x0, y, ANCHO_LISTA, altoEncabezado, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  COLUMNAS.forEach((c, i) => {
    textoEnCelda(doc, c.titulo, x, y, ANCHOS[i], altoEncabezado, "center", 8.5);
    x += ANCHOS[i];
  });
  y += altoEncabezado;

  // Renglones: se reparten en lo que queda de la hoja (sin pasar de 7.5 mm).
  const pie = 6;
  const disponible = HOJA_ALTO - MARGEN - pie - y;
  const altoFila = Math.max(4.8, Math.min(7.5, disponible / Math.max(1, p.seats.length)));
  const tamano = altoFila >= 6 ? 9.5 : 8;
  // Solo quien ocupa el asiento; los libres (y las bajas vacías) quedan en blanco para escribir.
  const filas = p.seats.map((seat) => {
    const e = seat.occupied ? seat.encontrado : null;
    return [
      `${p.sex}${p.teamNumber ?? ""}${seat.letter}`,
      e ? [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean).join(" ") : "",
      e ? (e.celular ? "Sí" : "No") : "",
      e ? (e.medicamento ? "Sí" : "No") : "",
      "",
      e ? (e.checkins?.claveOld ?? "") : "",
    ];
  });
  doc.setFont("helvetica", "normal");
  const tamanoNombre = tamanoQueCabe(
    doc,
    filas.map((f) => f[1]),
    ANCHOS[1],
    tamano,
  );
  doc.setTextColor(...TEXTO);
  filas.forEach((valores, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...FONDO_ALTERNO);
      doc.rect(x0, y, ANCHO_LISTA, altoFila, "F");
    }
    let cx = x0;
    COLUMNAS.forEach((c, j) => {
      doc.rect(cx, y, ANCHOS[j], altoFila, "S");
      doc.setFont("helvetica", j === 0 ? "bold" : "normal");
      textoEnCelda(
        doc,
        valores[j],
        cx,
        y,
        ANCHOS[j],
        altoFila,
        c.align,
        j === 1 ? tamanoNombre : tamano,
      );
      cx += ANCHOS[j];
    });
    y += altoFila;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...TEXTO_SUAVE);
  doc.text(`Impreso el ${impreso}`, x0, HOJA_ALTO - MARGEN + 1, { baseline: "middle" });
}

/**
 * Arma el PDF tamaño carta horizontal: una hoja por lista, con la misma lista dos veces
 * (una en cada mitad) y una línea punteada al centro para doblar. jsPDF se carga aquí, al
 * momento de exportar, para no pesar en Aforo.
 */
export async function generarListasEquiposPdf(
  listas: ListaEquipoPdfParams[],
): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const impreso = new Date().toLocaleString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  listas.forEach((lista, i) => {
    if (i > 0) doc.addPage("letter", "landscape");
    dibujarLista(doc, MARGEN, lista, impreso);
    dibujarLista(doc, MITAD + MARGEN, lista, impreso);

    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(MITAD, 4, MITAD, HOJA_ALTO - 4);
    doc.setLineDashPattern([], 0);
  });
  return doc;
}

/** Una sola lista (una hoja); ver `generarListasEquiposPdf`. */
export function generarListaEquipoPdf(params: ListaEquipoPdfParams): Promise<JsPDF> {
  return generarListasEquiposPdf([params]);
}

/** Descarga listas de equipos para imprimir: una sola o varias en un PDF (una hoja cada una). */
export function useExportListaEquipoPdf() {
  const [loading, setLoading] = useState(false);

  const exportListaEquipoPdf = async (params: ListaEquipoPdfParams) => {
    if (params.seats.length === 0) return;
    setLoading(true);
    try {
      const doc = await generarListaEquipoPdf(params);
      doc.save(`Equipo-${params.teamNumber ?? ""}-${params.sex}.pdf`);
    } catch {
      toast.error("No se pudo generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  /** Varias listas en un solo PDF, una hoja por lista, en el orden recibido. */
  const exportListasEquiposPdf = async (
    listas: ListaEquipoPdfParams[],
    nombreArchivo: string,
  ) => {
    if (listas.length === 0) return;
    setLoading(true);
    try {
      const doc = await generarListasEquiposPdf(listas);
      doc.save(nombreArchivo);
    } catch {
      toast.error("No se pudo generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  return { exportListaEquipoPdf, exportListasEquiposPdf, loading };
}
