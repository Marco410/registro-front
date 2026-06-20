"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Formatea el nombre para el gafete:
 * - Si el primer nombre tiene más de 4 letras → solo el primero.
 * - Si el primero tiene menos de 3 letras → primero y segundo; si el segundo tiene menos de 3 → primero, segundo y tercero; si el tercero tiene menos de 3 → primero, segundo, tercero y cuarto.
 */
function processName(nombre: string): string {
  const normalized = nombre.trim().replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const names = normalized.split(" ").filter(Boolean);
  if (names.length === 0) return "";

  const first = names[0];

  // Primer nombre con 3 o 4 letras → solo el primero
  if (first.length >= 4) return first;

  // Primer nombre con menos de 3 letras → ir añadiendo según longitud del siguiente
  if (names.length === 1) return first;
  if (names[1].length >= 3) return `${names[0]} ${names[1]}`;
  if (names.length === 2) return `${names[0]} ${names[1]}`;
  if (names[2].length >= 3) return `${names[0]} ${names[1]} ${names[2]}`;
  if (names.length === 3) return `${names[0]} ${names[1]} ${names[2]}`;
  return `${names[0]} ${names[1]} ${names[2]} ${names[3]}`;
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

function getSecondName(nombre: string): string | null {
  const names = nombre.trim().split(/\s+/).filter(Boolean);
  return names.length > 1 ? names[1] : null;
}

/** Apellidos + segundo nombre en letra pequeña para la fila inferior del gafete. */
function formatApellidosHtml(
  apellido_p: string,
  apellido_m: string | null | undefined,
  nombre: string,
): string {
  const apellidos = [apellido_p, apellido_m].filter(Boolean).join(" ").trim();
  const secondName = getSecondName(nombre);
  const apellidosHtml = escapeHtml(apellidos);
  if (!secondName) return apellidosHtml;
  return `${escapeHtml(secondName)} ${apellidosHtml}`;
}

/** Diferencia visualmente el 0 (cero tachado) de la O en códigos impresos. */
function formatClaveHtml(text: string): string {
  return [...text]
    .map((char) => {
      if (char === "0") return `<span class="gafete-char-zero">0</span>`;
      if (char === "O" || char === "o") {
        return `<span class="gafete-char-oh">${escapeHtml(char)}</span>`;
      }
      return escapeHtml(char);
    })
    .join("");
}

/**
 * Genera el HTML completo del documento a imprimir (solo gafetes, sin contenido de la página).
 * Se imprime en un iframe para que no aparezcan páginas en blanco del body principal.
 */
function buildPrintHtml({
  nombreFinal,
  clave,
  apellidosHtml,
  copies,
  imageUrl,
}: {
  nombreFinal: string;
  clave: string;
  apellidosHtml: string;
  copies: number;
  imageUrl: string;
}): string {
  const nameHtml = nombreFinal
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br/>");
  /* const pagesHtml = Array.from(
    { length: copies },
    () => `
    <div class="gafete-page">
      <img src="${escapeHtml(imageUrl)}" alt="" class="gafete-formato-img" loading="eager" />
      <p class="gafete-name">${nameHtml}</p>
      <div class="gafete-meta">
        <div class="gafete-fila-wrap gafete-fila-clave">
          <span class="gafete-fila-label">Clave:</span>
          <span class="gafete-fila-value">${escapeHtml(clave)}</span>
        </div>
        <div class="gafete-fila-wrap gafete-fila-tribu">
          <span class="gafete-fila-label">Tribu:</span>
          <span class="gafete-fila-value">${escapeHtml(equipo)}</span>
        </div>
      </div>
    </div>`,
  ).join(""); */

  const pagesHtml = Array.from(
    { length: copies },
    () => `
    <div class="gafete-page">
      <img src="${escapeHtml(imageUrl)}" alt="" class="gafete-formato-img" loading="eager" />
      <p class="gafete-name">${nameHtml}</p>
      <div class="gafete-meta">
        <div class="gafete-meta-block">
          <span class="gafete-clave">${formatClaveHtml(clave)}</span>
          <span class="gafete-apellidos">${apellidosHtml}</span>
        </div>
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
    .gafete-meta {
      position: absolute;
      left: 10px;
      bottom: 22px;
      z-index: 1;
      max-width: calc(100% - 68px);
    }
    .gafete-meta-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
      line-height: 1.05;
    }
    .gafete-clave {
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 23pt;
      font-weight: 800;
      color: #000;
      letter-spacing: 0.04em;
      font-variant-numeric: slashed-zero;
    }
    .gafete-apellidos {
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 7pt;
      font-weight: 700;
      color: #000;
      letter-spacing: 0.02em;
      margin-top: 3px;
      margin-bottom: 3px;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gafete-fila-wrap {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }
    .gafete-fila-label, .gafete-fila-value {
      font-family: 'Montserrat', Arial, sans-serif;
      color: #000;
    }
    .gafete-fila-clave .gafete-fila-label,
    .gafete-fila-clave .gafete-fila-value {
      font-size: 12pt;
    }
    .gafete-fila-label { font-weight: 500; }
    .gafete-fila-value { font-weight: 800; }
    .gafete-char-zero,
    .gafete-char-oh {
      position: relative;
      display: inline-block;
    }
    .gafete-char-zero::after {
      content: "";
      position: absolute;
      left: 8%;
      right: 8%;
      top: 48%;
      height: 2.5px;
      background: #000;
      transform: rotate(-40deg);
      pointer-events: none;
    }
    .gafete-char-oh {
      font-weight: 900;
    }
    .gafete-nombre-sec {
      font-size: 6pt;
      font-weight: 600;
      vertical-align: baseline;
    }
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
    async (
      nombre: string,
      clave: string,
      apellido_p: string,
      apellido_m: string | null | undefined,
      copies: number,
    ) => {
      if (typeof window === "undefined") return;
      setLoading(true);
      try {
        const nombreFinal = processName(nombre);
        const apellidosHtml = formatApellidosHtml(apellido_p, apellido_m, nombre);
        const imageUrl = `${window.location.origin}${IMAGE_URL}`;
        const html = buildPrintHtml({
          nombreFinal,
          clave,
          apellidosHtml,
          copies,
          imageUrl,
        });
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
