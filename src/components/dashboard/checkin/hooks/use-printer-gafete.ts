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

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Genera el HTML completo del documento a imprimir (solo gafetes, sin contenido de la página).
 * Se imprime en un iframe para que no aparezcan páginas en blanco del body principal.
 */
function buildPrintHtml(
  nombreFinal: string,
  fila: string,
  copies: number,
  imageUrl: string,
): string {
  const pagesHtml = Array.from(
    { length: copies },
    () => `
    <div class="gafete-page">
      <img src="${escapeHtml(imageUrl)}" alt="" class="gafete-formato-img" loading="eager" />
      <p class="gafete-name">${escapeHtml(nombreFinal)}</p>
      <div class="gafete-fila-wrap">
        <span class="gafete-fila-label">FILA:</span>
        <span class="gafete-fila-value">${escapeHtml(fila)}</span>
      </div>
    </div>`,
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gafete</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800;900&display=swap">
  <style>
    @media print {
      @page {
        size: ${GAFETE_WIDTH_MM}mm ${GAFETE_HEIGHT_MM}mm;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${GAFETE_WIDTH_MM}mm !important;
        min-height: ${GAFETE_HEIGHT_MM}mm !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    html, body { margin: 0; padding: 0; }
    .gafete-page {
      width: ${GAFETE_WIDTH_MM}mm;
      height: ${GAFETE_HEIGHT_MM}mm;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
    }
    .gafete-page:last-child { page-break-after: auto; }
    .gafete-formato-img {
      position: absolute;
      left: 0; top: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 0;
    }
    .gafete-name {
      position: absolute;
      left: 50%; top: 50%;
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
      left: 10px; bottom: 18px;
      z-index: 1;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .gafete-fila-label, .gafete-fila-value {
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 23pt;
      color: #000;
    }
    .gafete-fila-label { font-weight: 500; }
    .gafete-fila-value { font-weight: 800; }
  </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

function whenIframeImagesLoaded(iframe: HTMLIFrameElement): Promise<void> {
  const doc = iframe.contentDocument;
  if (!doc) return Promise.resolve();
  const imgs = doc.querySelectorAll<HTMLImageElement>("img.gafete-formato-img");
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

/**
 * Imprime el gafete en un iframe aislado para que solo salgan N páginas (una por copia),
 * sin páginas en blanco del documento principal.
 */
function printInIframe(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:100mm;height:62mm;border:0;";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      reject(new Error("No se pudo crear el documento de impresión"));
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    whenIframeImagesLoaded(iframe).then(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        reject(e);
      }
      const cleanup = () => {
        window.removeEventListener("afterprint", onAfterPrint);
        iframe.remove();
        resolve();
      };
      const onAfterPrint = () => cleanup();
      window.addEventListener("afterprint", onAfterPrint);
      setTimeout(cleanup, 1500);
    });
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
        const imageUrl = `${window.location.origin}${IMAGE_URL}`;
        const html = buildPrintHtml(nombreFinal, clave, copies, imageUrl);
        await printInIframe(html);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message ?? "Error al imprimir");
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError],
  );

  return { PrintGafete, loading };
}
