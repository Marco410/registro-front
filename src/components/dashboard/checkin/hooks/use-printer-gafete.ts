"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

/** Misma lógica que el backend para mostrar el nombre en el gafete. */
function processName(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length > 1) {
    if (partes[0].length > 12) return partes[0];
    return `${partes[0]} ${partes[1][0]}.`;
  }
  return nombre.length > 13 ? `${nombre}.` : nombre;
}

/** Tamaño de etiqueta Brother QL-800: 62mm ancho × 100mm largo, orientación horizontal. */
const GAFETE_WIDTH_MM = 100;
const GAFETE_HEIGHT_MM = 62;
const IMAGE_URL = "/images/formato.jpeg";

/**
 * Genera el HTML para imprimir el gafete.
 * Configuración recomendada en la impresora (Brother QL-800): papel 62mm, longitud 100mm,
 * orientación horizontal, cortar cada 1 etiqueta, cortar al final.
 * Nota: desde el navegador no se puede ocultar el diálogo de impresión ni fijar opciones
 * del driver; para impresión silenciosa hay que imprimir desde el servidor (backend).
 */
function buildPrintDocument(nombreFinal: string, fila: string, copies: number): HTMLDivElement {
  const root = document.createElement("div");
  root.id = "gafete-print-root";
  root.setAttribute("aria-hidden", "true");

  const style = document.createElement("style");
  style.textContent = `
    #gafete-print-root {
      position: fixed;
      left: -9999px;
      top: 0;
      z-index: -1;
      pointer-events: none;
    }
    @media print {
      @page {
        size: ${GAFETE_WIDTH_MM}mm ${GAFETE_HEIGHT_MM}mm;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${GAFETE_WIDTH_MM}mm !important;
        height: ${GAFETE_HEIGHT_MM}mm !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body * { visibility: hidden; }
      #gafete-print-root, #gafete-print-root * { visibility: visible; }
      #gafete-print-root {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        z-index: 99999;
        width: ${GAFETE_WIDTH_MM}mm !important;
        height: auto !important;
        pointer-events: none;
      }
      .gafete-page {
        page-break-after: always;
        page-break-inside: avoid;
        width: ${GAFETE_WIDTH_MM}mm !important;
        height: ${GAFETE_HEIGHT_MM}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      }
      .gafete-page:last-child { page-break-after: auto; }
    }
    .gafete-page {
      width: ${GAFETE_WIDTH_MM}mm;
      height: ${GAFETE_HEIGHT_MM}mm;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }
    .gafete-formato-img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 0;
    }
    .gafete-name {
      position: absolute;
      left: 50%;
      top: 40%;
      transform: translate(-50%, -50%);
      width: calc(100% - 10mm);
      text-align: center;
      font-family: 'Montserrat', 'Arial Black', sans-serif;
      font-weight: 900;
      font-size: 29pt;
      color: #000;
      margin: 0;
      z-index: 1;
    }
    .gafete-fila-wrap {
      position: absolute;
      left: 10px;
      bottom: 18px;
      z-index: 1;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .gafete-fila-label {
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 500;
      font-size: 23pt;
      color: #000;
    }
    .gafete-fila-value {
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 800;
      font-size: 23pt;
      color: #000;
    }
  `;
  root.appendChild(style);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800;900&display=swap";
  root.appendChild(link);

  const imageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${IMAGE_URL}`
      : IMAGE_URL;

  for (let i = 0; i < copies; i++) {
    const page = document.createElement("div");
    page.className = "gafete-page";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "";
    img.className = "gafete-formato-img";
    img.setAttribute("loading", "eager");
    const nameEl = document.createElement("p");
    nameEl.className = "gafete-name";
    nameEl.textContent = nombreFinal;
    const filaWrap = document.createElement("div");
    filaWrap.className = "gafete-fila-wrap";
    const filaLabel = document.createElement("span");
    filaLabel.className = "gafete-fila-label";
    filaLabel.textContent = "FILA:";
    const filaValue = document.createElement("span");
    filaValue.className = "gafete-fila-value";
    filaValue.textContent = fila;
    filaWrap.append(filaLabel, filaValue);
    page.append(img, nameEl, filaWrap);
    root.appendChild(page);
  }

  return root;
}

function whenImagesLoaded(root: HTMLDivElement): Promise<void> {
  const imgs = root.querySelectorAll<HTMLImageElement>("img.gafete-formato-img");
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        }),
    ),
  ).then(() => undefined);
}

function triggerPrint(): Promise<void> {
  return new Promise((resolve) => {
    const root = document.getElementById("gafete-print-root");
    if (!root) {
      resolve();
      return;
    }
    const onAfterPrint = () => {
      window.removeEventListener("afterprint", onAfterPrint);
      root.remove();
      resolve();
    };
    window.addEventListener("afterprint", onAfterPrint);
    window.print();
    setTimeout(() => {
      window.removeEventListener("afterprint", onAfterPrint);
      root.remove();
      resolve();
    }, 1000);
  });
}

export interface UsePrintGafeteOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePrintGafete(options: UsePrintGafeteOptions = {}) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);

  const PrintGafete = useCallback(
    async (nombre: string, clave: string, copies: number) => {
      if (typeof window === "undefined") return;
      setLoading(true);
      try {
        const nombreFinal = processName(nombre);
        const root = buildPrintDocument(nombreFinal, clave, copies);
        document.body.appendChild(root);
        await whenImagesLoaded(root);
        await triggerPrint();
        toast.success("Diálogo de impresión abierto");
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message ?? "Error al imprimir");
        onError?.(error);
      } finally {
        setLoading(false);
        document.getElementById("gafete-print-root")?.remove();
      }
    },
    [onSuccess, onError],
  );

  return { PrintGafete, loading };
}
