"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

/** Media carta: mitad superior de hoja carta (8.5" × 5.5"). */
const CERT_WIDTH_IN = 8.5;
const CERT_HEIGHT_IN = 5.5;
const IMAGE_URL = "/images/certificado.png";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function formatCertificateDate(date: Date = new Date()): string {
  const day = date.getDate();
  const monthRaw = date.toLocaleDateString("es-MX", { month: "long" });
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
  const year = date.getFullYear();
  return `Morelia, Mich. ${day} de ${month} ${year}`;
}

export function formatCertificateFullName(
  nombre: string,
  apellido_p: string,
  apellido_m?: string | null,
): string {
  return [nombre, apellido_p, apellido_m]
    .filter(Boolean)
    .join(" ")
    .trim()
    .toUpperCase();
}

function getNameFontSize(nameLength: number): string {
 /*  if (nameLength > 42) return "20pt";
  if (nameLength > 34) return "22pt";
  if (nameLength > 26) return "24pt";
  if (nameLength > 20) return "26pt"; */
  return "23pt";
}

function buildPrintHtml({
  fecha,
  nombreCompleto,
  imageUrl,
}: {
  fecha: string;
  nombreCompleto: string;
  imageUrl: string;
}): string {
  const nameFontSize = getNameFontSize(nombreCompleto.length);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificado de bautismo</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap">
  <style>
    @media print {
      @page {
        size: letter portrait;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${CERT_WIDTH_IN}in !important;
        height: ${CERT_HEIGHT_IN}in !important;
        max-height: ${CERT_HEIGHT_IN}in !important;
        overflow: hidden !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${CERT_WIDTH_IN}in;
      height: ${CERT_HEIGHT_IN}in;
      overflow: hidden;
    }
    .cert-page {
      width: ${CERT_WIDTH_IN}in;
      height: ${CERT_HEIGHT_IN}in;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .cert-bg {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 0;
    }
    .cert-date {
      position: absolute;
      left: 50%;
      bottom: 31.5%;
      transform: translateX(-50%);
      width: 88%;
      margin: 0;
      text-align: center;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #333;
      z-index: 1;
    }
    .cert-name {
      position: absolute;
      left: 50%;
      top: 37.5%;
      transform: translateX(-50%);
      width: 90%;
      margin: 0;
      text-align: center;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: ${nameFontSize};
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1.1;
      color: #111;
      z-index: 1;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="cert-page">
    <img src="${escapeHtml(imageUrl)}" alt="" class="cert-bg" loading="eager" />
    <p class="cert-date">${escapeHtml(fecha)}</p>
    <p class="cert-name">${escapeHtml(nombreCompleto)}</p>
  </div>
</body>
</html>`;
}

function whenIframeImagesLoaded(iframe: HTMLIFrameElement): Promise<void> {
  const doc = iframe.contentDocument;
  if (!doc) return Promise.resolve();
  const imgs = doc.querySelectorAll<HTMLImageElement>("img.cert-bg");
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

function printInIframe(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:8.5in;height:5.5in;border:0;";
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
        return;
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

export interface UsePrintCertificateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePrintCertificate(options: UsePrintCertificateOptions = {}) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);

  const PrintCertificate = useCallback(
    async (
      nombre: string,
      apellido_p: string,
      apellido_m?: string | null,
      fecha?: Date,
    ) => {
      if (typeof window === "undefined") return;
      setLoading(true);
      try {
        const nombreCompleto = formatCertificateFullName(
          nombre,
          apellido_p,
          apellido_m,
        );
        if (!nombreCompleto) {
          throw new Error("No hay nombre para imprimir en el certificado");
        }
        const fechaTexto = formatCertificateDate(fecha ?? new Date());
        const imageUrl = `${window.location.origin}${IMAGE_URL}`;
        const html = buildPrintHtml({
          fecha: fechaTexto,
          nombreCompleto,
          imageUrl,
        });
        await printInIframe(html);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message ?? "Error al imprimir el certificado");
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError],
  );

  return { PrintCertificate, loading };
}
