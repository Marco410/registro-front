"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { jsPDF as JsPDF } from "jspdf";
import { formatCertificateDate } from "./use-printer-certificate";

/**
 * Constancias de bautismo en PDF: una por página, igual que la impresión individual de
 * `use-printer-certificate` (hoja carta vertical con la constancia de media carta, 8.5" × 5.5",
 * en la mitad de arriba), porque se imprimen en hojas ya cortadas a la mitad. Mismo fondo,
 * Montserrat Bold y mismas posiciones.
 */
const HOJA_ANCHO = 215.9;
const CONSTANCIA_ALTO = 139.7;

const PT = 25.4 / 72;
/** Métricas de Montserrat (hhea): lo que sube y baja la letra, en em. */
const ASCENT = 0.968;
const DESCENT = 0.251;

/**
 * Nombre: caja arriba al 37.5 %, 23 pt, interlineado 1.1, ancho 90 %, espaciado 0.06 em.
 * Si no cabe en un renglón, la letra baja hasta `minSize` antes de partirlo (en dos renglones
 * se encimaría con el texto de la constancia).
 */
const NOMBRE = { top: 0.375, size: 23, minSize: 16, lineHeight: 1.1, ancho: 0.9, espacio: 0.06 };
/** Fecha: caja abajo al 31.5 %, 8 pt, ancho 88 %, espaciado 0.02 em. */
const FECHA = { bottom: 0.315, size: 8, ancho: 0.88, espacio: 0.02 };

const IMAGEN_URL = "/images/certificado.png";
const FUENTE_URL = "/fonts/Montserrat-Bold.ttf";
const FUENTE_ARCHIVO = "Montserrat-Bold.ttf";

export interface ConstanciaAssets {
  /** `certificado.png`. */
  imagen: Uint8Array;
  /** Montserrat Bold en base64 (jsPDF la necesita así). */
  fuenteBase64: string;
}

/** Ancho de un texto con el espaciado entre letras que usa el CSS (`letter-spacing`). */
function anchoConEspacio(doc: JsPDF, texto: string, espacio: number): number {
  return doc.getTextWidth(texto) + espacio * Math.max(0, texto.length - 1);
}

/** Parte el nombre en renglones que quepan en `ancho`, como el ajuste del navegador. */
function renglones(doc: JsPDF, texto: string, ancho: number, espacio: number): string[] {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (actual && anchoConEspacio(doc, prueba, espacio) > ancho) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Texto centrado en `cx` con espaciado entre letras (jsPDF no lo considera al centrar). */
function textoCentrado(doc: JsPDF, texto: string, cx: number, y: number, espacio: number) {
  const x = cx - anchoConEspacio(doc, texto, espacio) / 2;
  doc.text(texto, x, y, { baseline: "alphabetic", charSpace: espacio });
}

function dibujarConstancia(
  doc: JsPDF,
  y0: number,
  nombre: string,
  fecha: string,
  imagen: Uint8Array,
) {
  // Con el mismo alias, jsPDF guarda la imagen una sola vez y la reutiliza en cada constancia.
  doc.addImage(imagen, "PNG", 0, y0, HOJA_ANCHO, CONSTANCIA_ALTO, "certificado", "FAST");
  const cx = HOJA_ANCHO / 2;

  // Nombre: la caja empieza en `top`; la línea base queda a medio interlineado + lo que sube.
  const anchoNombre = NOMBRE.ancho * HOJA_ANCHO;
  let size = NOMBRE.size;
  doc.setFontSize(size);
  while (
    size > NOMBRE.minSize &&
    anchoConEspacio(doc, nombre, NOMBRE.espacio * size * PT) > anchoNombre
  ) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  const emNombre = size * PT;
  const espacioNombre = NOMBRE.espacio * emNombre;
  const mitadInterlineado = (NOMBRE.lineHeight - (ASCENT + DESCENT)) / 2;
  const baseNombre = y0 + NOMBRE.top * CONSTANCIA_ALTO + (mitadInterlineado + ASCENT) * emNombre;
  doc.setTextColor(17, 17, 17);
  renglones(doc, nombre, anchoNombre, espacioNombre).forEach((linea, i) => {
    textoCentrado(doc, linea, cx, baseNombre + i * NOMBRE.lineHeight * emNombre, espacioNombre);
  });

  // Fecha: la caja termina en `bottom`; la línea base queda a lo que baja la letra.
  const emFecha = FECHA.size * PT;
  const baseFecha = y0 + (1 - FECHA.bottom) * CONSTANCIA_ALTO - DESCENT * emFecha;
  doc.setFontSize(FECHA.size);
  doc.setTextColor(51, 51, 51);
  textoCentrado(doc, fecha, cx, baseFecha, FECHA.espacio * emFecha);
}

/**
 * Arma el PDF con una constancia por nombre, una por página (mitad de arriba de la carta).
 * @param nombres Nombres completos, ya en mayúsculas (`formatCertificateFullName`)
 * @param fecha Texto de la fecha (`formatCertificateDate`)
 */
export async function generarConstanciasPdf(
  nombres: string[],
  fecha: string,
  assets: ConstanciaAssets,
): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  doc.addFileToVFS(FUENTE_ARCHIVO, assets.fuenteBase64);
  doc.addFont(FUENTE_ARCHIVO, "Montserrat", "bold");
  doc.setFont("Montserrat", "bold");

  nombres.forEach((nombre, i) => {
    if (i > 0) doc.addPage("letter", "portrait");
    dibujarConstancia(doc, 0, nombre, fecha, assets.imagen);
  });
  return doc;
}

function aBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

let assetsPromise: Promise<ConstanciaAssets> | null = null;

/** Baja el fondo y la fuente una sola vez por sesión. */
function cargarAssets(): Promise<ConstanciaAssets> {
  assetsPromise ??= Promise.all([
    fetch(IMAGEN_URL).then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar la imagen de la constancia");
      return r.arrayBuffer();
    }),
    fetch(FUENTE_URL).then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar la fuente de la constancia");
      return r.arrayBuffer();
    }),
  ])
    .then(([imagen, fuente]) => ({
      imagen: new Uint8Array(imagen),
      fuenteBase64: aBase64(fuente),
    }))
    .catch((err) => {
      assetsPromise = null;
      throw err;
    });
  return assetsPromise;
}

/** Descarga en un PDF las constancias de bautismo de varias personas (una por página). */
export function useExportConstanciasPdf() {
  const [loading, setLoading] = useState(false);

  const exportConstanciasPdf = async (nombres: string[], nombreArchivo: string) => {
    if (nombres.length === 0) return;
    setLoading(true);
    try {
      const assets = await cargarAssets();
      const doc = await generarConstanciasPdf(nombres, formatCertificateDate(), assets);
      doc.save(nombreArchivo);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message ? err.message : "No se pudieron generar las constancias",
      );
    } finally {
      setLoading(false);
    }
  };

  return { exportConstanciasPdf, loading };
}
