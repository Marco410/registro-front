"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Esqueletos de carga. Reglas:
 * - Toda carga de contenido es un esqueleto con la forma de lo que va a llegar (nunca
 *   un spinner ni la palabra «Cargando»); al llegar el contenido, nada se mueve.
 * - Lo que no depende de los datos (títulos, encabezados, etiquetas) se pinta de verdad;
 *   solo late lo que falta.
 * - El brillo recorre los huesos cada 1.4s (latido con prefers-reduced-motion).
 * - La región lleva aria-busy y un nombre («Cargando asientos»); los huesos no se leen.
 * - A los 10 s sin datos se añade una línea que lo dice; si falla, el esqueleto se
 *   cambia por el error en el mismo sitio.
 * - Al volver a leer algo que ya se ve no vuelve el esqueleto: el contenido se queda,
 *   atenuado, bajo la barra de espera.
 * - Cada pieza trae su esqueleto; quien la usa solo le dice que está cargando.
 */

/** Hueso genérico: lleva el radio de la pieza que va a ser (pásalo en className). */
export function Bone({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <span aria-hidden className={`skeleton-bone block ${className}`} style={style} />;
}

const TEXT_HEIGHT = {
  /** Una línea de texto. */
  line: "h-3",
  /** Un título. */
  title: "h-5",
  /** Una cifra. */
  figure: "h-7",
} as const;

/**
 * Hueso de texto: píldora de 12px (línea), 20px (título) o 28px (cifra). Varía el
 * ancho de una fila a otra; iguales parecen una tabla vacía.
 */
export function TextBone({
  size = "line",
  width,
  className = "",
}: {
  size?: keyof typeof TEXT_HEIGHT;
  width: number | string;
  className?: string;
}) {
  return (
    <Bone
      className={`${TEXT_HEIGHT[size]} rounded-full ${className}`}
      style={{ width }}
    />
  );
}

/** Línea que aparece si la carga pasa de `afterMs` (10 s por defecto). */
export function SlowLoadNotice({
  afterMs = 10_000,
  children = "Está tardando más de lo normal. Revisa la conexión; si no carga, recarga la página.",
  className = "",
}: {
  afterMs?: number;
  children?: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), afterMs);
    return () => clearTimeout(timer);
  }, [afterMs]);
  if (!visible) return null;
  return (
    <p
      role="status"
      className={`text-xs text-app-text-secondary dark:text-gray-400 ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * Barra de espera indeterminada (2px) para recargas de algo que ya se ve. Ocupa su
 * espacio siempre para que mostrarla no mueva nada.
 */
export function WaitBar({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="h-0.5 overflow-hidden">
      {active ? (
        <div className="wait-bar h-full w-1/3 rounded-full bg-app-primary dark:bg-app-primary-muted" />
      ) : null}
    </div>
  );
}

/**
 * `true` solo cuando `value` lleva al menos `delayMs` en `true`. Evita que una recarga
 * rápida atenúe y desatenúe el contenido en un parpadeo.
 */
export function useDelayedFlag(value: boolean, delayMs = 300): boolean {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!value) {
      setFlag(false);
      return;
    }
    const timer = setTimeout(() => setFlag(true), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return flag;
}
