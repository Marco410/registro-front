"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { jsPDF as JsPDF } from "jspdf";
import type { Seat } from "registro/graphql/aforo/queries";
import { cargadorPdfAssets, type PdfAssets } from "registro/lib/pdf-assets";
import { getSeatSex } from "../seat-utils";

/**
 * Etiquetas de equipo en PDF: simulan el gafete (`use-printer-gafete`): misma etiqueta Brother
 * QL-800 de 100 × 62 mm, mismo fondo y Montserrat Black, pero en lugar del nombre solo el
 * código del equipo ("H1", "M12"), grande al centro. Una etiqueta por página.
 */
const ANCHO = 100;
const ALTO = 62;
const TAMANO_PT = 60;
const PT = 25.4 / 72;
/** Métricas de Montserrat (hhea): lo que sube y baja la letra, en em. */
const ASCENT = 0.968;
const DESCENT = 0.251;

const IMAGEN_URL = "/images/formato.jpeg";
const FUENTE_URL = "/fonts/Montserrat-Black.ttf";
const FUENTE_ARCHIVO = "Montserrat-Black.ttf";
const FUENTE_FAMILIA = "MontserratBlack";

/** Código del equipo para un sexo ("H1"), solo si tiene asientos ocupados de ese sexo. */
export function codigoEtiquetaEquipo(
  seatsDelEquipo: Seat[],
  sex: "H" | "M",
): string | null {
  const ocupado = seatsDelEquipo.find((s) => getSeatSex(s) === sex && s.occupied);
  const numero = ocupado?.team?.teamNumber;
  return numero != null ? `${sex}${numero}` : null;
}

/**
 * Arma el PDF con una etiqueta por código, en el orden recibido.
 * @param assets `formato.jpeg` y Montserrat Black en base64
 */
export async function generarEtiquetasEquiposPdf(
  codigos: string[],
  assets: PdfAssets,
): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [ALTO, ANCHO] });
  doc.addFileToVFS(FUENTE_ARCHIVO, assets.fuenteBase64);
  doc.addFont(FUENTE_ARCHIVO, FUENTE_FAMILIA, "normal");

  // Como el nombre del gafete: la caja de texto va centrada a la mitad de la etiqueta.
  const em = TAMANO_PT * PT;
  const base = ALTO / 2 + ((ASCENT - DESCENT) / 2) * em;

  codigos.forEach((codigo, i) => {
    if (i > 0) doc.addPage([ALTO, ANCHO], "landscape");
    // Con el mismo alias, jsPDF guarda el fondo una sola vez.
    doc.addImage(assets.imagen, "JPEG", 0, 0, ANCHO, ALTO, "formato", "FAST");
    doc.setFont(FUENTE_FAMILIA, "normal");
    doc.setFontSize(TAMANO_PT);
    doc.setTextColor(0, 0, 0);
    doc.text(codigo, ANCHO / 2, base, { align: "center", baseline: "alphabetic" });
  });
  return doc;
}

const cargarAssets = cargadorPdfAssets(IMAGEN_URL, FUENTE_URL);

/** Descarga en un PDF las etiquetas de los equipos (una por página). */
export function useExportEtiquetasEquiposPdf() {
  const [loading, setLoading] = useState(false);

  const exportEtiquetasEquiposPdf = async (codigos: string[], nombreArchivo: string) => {
    if (codigos.length === 0) return;
    setLoading(true);
    try {
      const doc = await generarEtiquetasEquiposPdf(codigos, await cargarAssets());
      doc.save(nombreArchivo);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message ? err.message : "No se pudieron generar las etiquetas",
      );
    } finally {
      setLoading(false);
    }
  };

  return { exportEtiquetasEquiposPdf, loading };
}
