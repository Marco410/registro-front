"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Download01Icon,
  PrinterIcon,
  Search01Icon,
  SeatSelectorIcon,
  Tag01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "registro/hooks/use-auth";
import { isAdmin } from "registro/lib/auth";
import {
  Bone,
  SlowLoadNotice,
  TextBone,
  WaitBar,
} from "registro/components/shared/Skeleton";
import {
  RANGO_EDAD_BAR_CLASS,
  SEAT_SIZE_CLASS,
  SEX_STYLES,
  TEAM_ROW_GRID,
} from "./seat-utils";

/*
 * Piezas de la tarjeta "Asientos por equipo" que no dependen de los datos. Las comparten
 * la tarjeta real (SeatsByTeam) y su esqueleto, para que al llegar los asientos nada se
 * mueva. Este módulo es liviano: no importa asientos ni modales, así sirve también de
 * fallback mientras carga el código de SeatsByTeam.
 */

export const SEATS_CARD_CLASS =
  "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#202124]";

const LEGEND_ITEMS = [
  {
    label: "Libre",
    className:
      "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60",
  },
  {
    label: "Ocupado · hombre",
    className:
      "border-app-primary/45 bg-app-primary dark:border-app-primary-muted/50 dark:bg-app-primary-muted",
  },
  {
    label: "Ocupado · mujer",
    className: "border-pink-400/45 bg-pink-500",
  },
  {
    label: "Dado de baja",
    className: "border-gray-400/50 bg-gray-500 dark:bg-gray-600",
  },
];

function SeatsLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {LEGEND_ITEMS.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-[0.6875rem] text-app-text-secondary dark:text-gray-400"
        >
          <span
            className={`h-3.5 w-3.5 rounded-[3px] border ${item.className}`}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5 text-[0.6875rem] text-app-text-secondary dark:text-gray-400">
        <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
        Bautizado
      </li>
      <li
        className="flex items-center gap-1.5 text-[0.6875rem] text-app-text-secondary dark:text-gray-400"
        title="Alguien dejó este asiento (baja) y ahora lo ocupa otra persona."
      >
        <span className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400" aria-hidden />
        Ocupado tras una baja
      </li>
      <li
        className="flex items-center gap-1.5 text-[0.6875rem] text-app-text-secondary dark:text-gray-400"
        title="Está en un grupo de edad que no es el suyo, dentro de la primera búsqueda (2 grupos arriba y 2 abajo)."
      >
        <span
          className={`h-[0.1875rem] w-3 rounded-full ${RANGO_EDAD_BAR_CLASS.cercano}`}
          aria-hidden
        />
        Fuera de rango · cercano
      </li>
      <li
        className="flex items-center gap-1.5 text-[0.6875rem] text-app-text-secondary dark:text-gray-400"
        title="Está en un grupo de edad más lejos que la primera búsqueda (más de 2 grupos arriba o abajo)."
      >
        <span
          className={`h-[0.1875rem] w-3 rounded-full ${RANGO_EDAD_BAR_CLASS.lejano}`}
          aria-hidden
        />
        Fuera de rango · lejano
      </li>
    </ul>
  );
}

const actionButtonClass =
  "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-app-primary-muted";

type AccionIcon = typeof SeatSelectorIcon;

interface Accion {
  label: string;
  icon: AccionIcon;
  /** Sin acción, la opción queda deshabilitada (p. ej. mientras carga). */
  onClick?: () => void;
}

const MENU_GAP = 4;
const VIEWPORT_PADDING = 8;

/**
 * Botón "Más acciones" con su menú. El menú va en un portal con posición fija porque la
 * tarjeta recorta lo que se sale (`overflow-hidden`); se alinea a la derecha del botón,
 * se cierra al elegir, con Esc, al hacer clic fuera o al hacer scroll.
 */
function MasAcciones({ acciones }: { acciones: Accion[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) {
      setPos(null);
      return;
    }
    const t = triggerRef.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(t.right - m.width, window.innerWidth - m.width - VIEWPORT_PADDING),
    );
    setPos({ top: t.bottom + MENU_GAP, left });
    menuRef.current.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const cerrar = () => setOpen(false);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      cerrar();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      cerrar();
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={actionButtonClass}
      >
        Más acciones
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label="Más acciones"
              className="fixed z-50 min-w-[13rem] rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#202124]"
              style={{
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                visibility: pos ? "visible" : "hidden",
              }}
            >
              {acciones.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  role="menuitem"
                  disabled={!a.onClick}
                  onClick={() => {
                    setOpen(false);
                    a.onClick?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
                >
                  <HugeiconsIcon
                    icon={a.icon}
                    size={16}
                    className="shrink-0 text-app-text-secondary dark:text-gray-400"
                  />
                  {a.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export interface SeatsActionsProps {
  admin: boolean;
  onBuscar?: () => void;
  onGestionarAsientos?: () => void;
  onGestionarEquipos?: () => void;
  onExportar?: () => void;
  /** Abre "Imprimir listas" (PDF carta por equipo); para cualquier usuario. */
  onImprimirListas?: () => void;
  /** Abre "Etiquetas equipos" (PDF tipo gafete con el código de cada equipo). */
  onEtiquetasEquipos?: () => void;
}

/**
 * Acciones del encabezado: "Buscar encontrado" a la vista y las demás en "Más acciones".
 * Una acción sin handler queda deshabilitada (p. ej. mientras carga).
 */
export function SeatsActions({
  admin,
  onBuscar,
  onGestionarAsientos,
  onGestionarEquipos,
  onExportar,
  onImprimirListas,
  onEtiquetasEquipos,
}: SeatsActionsProps) {
  const acciones: Accion[] = [
    { label: "Gestionar asientos", icon: SeatSelectorIcon, onClick: onGestionarAsientos },
    ...(admin
      ? [{ label: "Gestionar equipos", icon: UserGroupIcon, onClick: onGestionarEquipos }]
      : []),
    { label: "Exportar Excel", icon: Download01Icon, onClick: onExportar },
    { label: "Imprimir listas", icon: PrinterIcon, onClick: onImprimirListas },
    { label: "Etiquetas equipos", icon: Tag01Icon, onClick: onEtiquetasEquipos },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onBuscar}
        disabled={!onBuscar}
        className="flex items-center gap-2 rounded-lg bg-app-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-app-primary/90 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900 dark:hover:bg-app-primary-muted/90"
      >
        <HugeiconsIcon icon={Search01Icon} size={16} className="shrink-0" />
        Buscar encontrado
      </button>
      <MasAcciones acciones={acciones} />
    </div>
  );
}

/** Título, leyenda y acciones de la tarjeta. */
export function SeatsCardHeader({ actions }: { actions: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-1.5">
        <h2 className="text-base font-semibold text-app-text-primary dark:text-white">
          Asientos por equipo
        </h2>
        <SeatsLegend />
      </div>
      {actions}
    </div>
  );
}

export function AltarMarker() {
  return (
    <div className="mb-3 flex flex-col items-center gap-1" aria-hidden>
      <div className="h-1.5 w-full max-w-sm rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-app-text-secondary dark:text-gray-400">
        Altar
      </span>
    </div>
  );
}

/**
 * Contenedor de la cuadrícula con el pasillo central. El tamaño de asiento (xl+) se
 * calcula con el ancho de este contenedor, no de la ventana, para que quepan 18 asientos
 * por lado con o sin la barra lateral: (50cqw − 6.25rem de pasillo y márgenes − 17 huecos
 * de 0.25rem) / 18, entre 1.25rem y 1.75rem (20–28px al 100%). Va en rem para que
 * escale con el tamaño de texto del sistema.
 */
export function SeatsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="relative [--seat-size:clamp(1.25rem,calc((50cqw_-_10.5rem)_/_18),1.75rem)] [container-type:inline-size]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-40 -translate-x-1/2 rounded-xl bg-gray-50 dark:bg-white/[0.03] xl:block"
      />
      {children}
    </div>
  );
}

/** "HOMBRES" / "MUJERES" con su línea de totales (real o hueso). */
export function GenderHeading({
  sex,
  align,
  children,
}: {
  sex: "H" | "M";
  align: "start" | "end";
  children: ReactNode;
}) {
  const style = SEX_STYLES[sex];
  return (
    <div className={align === "end" ? "xl:text-right" : "text-left"}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
        {style.label}
      </p>
      {children}
    </div>
  );
}

/** Fila de encabezados de columna: hombres | "Equipo" | mujeres. */
export function SeatsColumnsHeader({
  hombres,
  mujeres,
}: {
  hombres: ReactNode;
  mujeres: ReactNode;
}) {
  return (
    <div className={`relative grid grid-cols-2 gap-x-3 gap-y-2 px-2 pb-2 ${TEAM_ROW_GRID}`}>
      {hombres}
      <p className="hidden self-end text-center text-[0.625rem] font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400 xl:block">
        Equipo
      </p>
      {mujeres}
    </div>
  );
}

/** Filas del esqueleto: los anchos varían para no parecer una tabla vacía. */
const SKELETON_ROWS = [
  { h: 15, m: 17, nombre: 56, edad: 30 },
  { h: 16, m: 18, nombre: 60, edad: 26 },
  { h: 15, m: 17, nombre: 54, edad: 32 },
  { h: 14, m: 16, nombre: 64, edad: 28 },
  { h: 15, m: 17, nombre: 58, edad: 30 },
  { h: 16, m: 18, nombre: 62, edad: 34 },
  { h: 15, m: 16, nombre: 60, edad: 26 },
  { h: 14, m: 17, nombre: 66, edad: 30 },
];

function SeatsLineSkeleton({
  count,
  sex,
  className,
}: {
  count: number;
  sex: "H" | "M";
  className: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <span
        className={`w-4 shrink-0 text-[0.6875rem] font-semibold xl:hidden ${SEX_STYLES[sex].text}`}
        aria-hidden
      >
        {sex}
      </span>
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} className={`${SEAT_SIZE_CLASS} shrink-0 rounded`} />
      ))}
    </div>
  );
}

/** Conteo "ocupados/total" de un equipo mientras carga; la letra H/M (móvil) es real. */
function CountSkeleton({ sex, className }: { sex: "H" | "M"; className: string }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1 px-1.5 py-1 text-[0.6875rem] font-semibold xl:py-0.5 ${SEX_STYLES[sex].text} ${className}`}
    >
      <span className="xl:hidden">{sex}</span>
      <TextBone width={24} />
    </span>
  );
}

/** Totales de un lado mientras cargan: misma altura que la línea real (0.6875rem × 1.5). */
function GenderLineSkeleton({ align }: { align: "start" | "end" }) {
  return (
    <div className={`flex h-[1.03125rem] items-center ${align === "end" ? "xl:justify-end" : ""}`}>
      <TextBone width={align === "end" ? 176 : 164} />
    </div>
  );
}

/**
 * Esqueleto del cuerpo de la tarjeta: altar y encabezados reales, y 8 equipos con la
 * misma estructura que TeamSeatsRow (asientos del tamaño real, nombre, rango y conteos).
 * A los 10 s sin datos añade una línea que lo dice.
 */
export function SeatsGridSkeleton() {
  return (
    <div className="p-2 sm:p-4" aria-hidden>
      <AltarMarker />
      <SeatsGrid>
        <SeatsColumnsHeader
          hombres={
            <GenderHeading sex="H" align="end">
              <GenderLineSkeleton align="end" />
            </GenderHeading>
          }
          mujeres={
            <GenderHeading sex="M" align="start">
              <GenderLineSkeleton align="start" />
            </GenderHeading>
          }
        />
        <div className="divide-y divide-gray-100 dark:divide-gray-800 xl:divide-y-0">
          {SKELETON_ROWS.map((row, i) => (
            <div
              key={i}
              className={`relative grid grid-cols-1 gap-x-3 gap-y-1.5 px-2 py-2.5 xl:py-1 ${TEAM_ROW_GRID}`}
            >
              <SeatsLineSkeleton
                count={row.h}
                sex="H"
                className="order-2 xl:order-1 xl:justify-end"
              />
              <div className="order-1 flex items-center gap-1 xl:order-2 xl:grid xl:grid-cols-[2.5rem_minmax(0,1fr)_2.5rem]">
                {/* Mismas alturas de línea que el nombre (text-xs) y la edad (10px, leading-tight). */}
                <div className="mr-2 flex min-w-0 flex-col xl:order-2 xl:mr-0 xl:items-center">
                  <span className="flex h-4 items-center">
                    <TextBone width={row.nombre} />
                  </span>
                  <span className="flex h-[0.78125rem] items-center">
                    <TextBone width={row.edad} />
                  </span>
                </div>
                <CountSkeleton sex="H" className="xl:order-1 xl:justify-self-start" />
                <CountSkeleton sex="M" className="xl:order-3 xl:justify-self-end" />
              </div>
              <SeatsLineSkeleton count={row.m} sex="M" className="order-3" />
            </div>
          ))}
        </div>
      </SeatsGrid>
    </div>
  );
}

/**
 * Tarjeta completa mientras carga el código de SeatsByTeam (fallback del import
 * dinámico). Es la misma tarjeta que SeatsByTeam muestra mientras llegan los datos.
 */
export function SeatsByTeamSkeleton() {
  const { user } = useAuth();
  return (
    <section
      aria-busy="true"
      aria-label="Cargando asientos"
      className={SEATS_CARD_CLASS}
    >
      <SeatsCardHeader actions={<SeatsActions admin={isAdmin(user)} />} />
      <WaitBar active={false} />
      <SeatsGridSkeleton />
      <SlowLoadNotice className="px-4 pb-4 text-center" />
    </section>
  );
}
