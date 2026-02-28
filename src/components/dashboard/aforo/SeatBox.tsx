"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@apollo/client";
import { Seat, SEATS_QUERY } from "registro/graphql/aforo/queries";
import {
  UPDATE_SEAT_MUTATION,
  type UpdateSeatVariables,
} from "registro/graphql/aforo/mutations";
import { ConfirmDarDeBajaModal } from "registro/components/dashboard/aforo/ConfirmDarDeBajaModal";
import { ConfirmarBautizoModal } from "registro/components/dashboard/aforo/ConfirmarBautizoModal";
import { AsignarAsientoModal } from "registro/components/dashboard/aforo/AsignarAsientoModal";
import { toast } from "sonner";

const SEAT_SIZE = "h-7 w-7";
const SEAT_TEXT = "text-xs";
const MENU_OFFSET = 4;
const VIEWPORT_PADDING = 8;

/** Copia texto al portapapeles; usa fallback si navigator.clipboard no está disponible (ej. sin HTTPS). */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyFallback(text);
    }
  }
  return copyFallback(text);
}

function copyFallback(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function ocupadoPor(seat: Seat): string {
  if (!seat.occupied || !seat.encontrado) return "";
  const e = seat.encontrado;
  return `${e.nombre} ${e.apellido_p} ${e.apellido_m}`.trim();
}

export interface SeatBoxProps {
  seat: Seat;
  sex: "H" | "M";
}

export function SeatBox({ seat, sex }: SeatBoxProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBautizo, setShowConfirmBautizo] = useState(false);
  const [accionBautizo, setAccionBautizo] = useState<"aplicar" | "quitar">(
    "aplicar",
  );
  const [showAsignar, setShowAsignar] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [updateSeat, { loading: updating }] = useMutation<
    unknown,
    UpdateSeatVariables
  >(UPDATE_SEAT_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
  });

  const occupied = seat.occupied;
  const abandoned = seat.abandoned;
  const isMale = sex === "H";
  const canDarDeBaja = occupied && seat.encontrado?.id && !abandoned;

  const filledClass = abandoned
    ? "bg-gray-400/90 text-white border-gray-500 dark:bg-gray-600 dark:border-gray-500"
    : occupied
      ? isMale
        ? "bg-app-primary/90 text-white border-app-primary dark:bg-app-primary-muted dark:border-app-primary-muted"
        : "bg-pink-500/90 text-white border-pink-500 dark:bg-pink-500 dark:border-pink-500"
      : "bg-transparent border-gray-300 text-app-text-secondary dark:border-gray-600 dark:text-gray-400";

  const tooltipText = abandoned
    ? seat.abandonedBy
      ? `Baja: ${seat.abandonedBy.nombre} ${seat.abandonedBy.apellido_p} ${seat.abandonedBy.apellido_m}`
      : "Dado de baja"
    : occupied && seat.encontrado
      ? `${seat.encontrado.nombre} ${seat.encontrado.apellido_p} ${seat.encontrado.apellido_m} | ${seat.gender}${seat.team?.teamNumber}${seat.letter} | Edad: ${seat.encontrado.edad}`
      : null;

  const handleDarDeBaja = async () => {
    if (!seat.encontrado?.id) return;
    await updateSeat({
      variables: {
        where: { id: seat.id },
        data: {
          abandoned: true,
          occupied: false,
          abandonedBy: { connect: { id: seat.encontrado.id } },
        },
      },
    });
    setShowConfirm(false);
  };

  const hasBautizo = Boolean(seat.encontrado?.bautizo);

  useLayoutEffect(() => {
    if (!menuOpen || !buttonRef.current || !menuRef.current) {
      setMenuPosition(null);
      return;
    }
    const btn = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;

    let top = btn.bottom + MENU_OFFSET;
    let left = btn.left;

    if (top + menu.height > vh - VIEWPORT_PADDING) {
      top = btn.top - menu.height - MENU_OFFSET;
    }
    if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;

    if (left + menu.width > vw - VIEWPORT_PADDING) {
      left = vw - menu.width - VIEWPORT_PADDING;
    }
    if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

    setMenuPosition({ top, left });
  }, [menuOpen]);

  return (
    <>
      <div className="group relative inline-flex">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={`flex shrink-0 cursor-pointer items-center justify-center rounded border ${SEAT_SIZE} ${SEAT_TEXT} font-medium transition-colors hover:ring-2 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500 ${filledClass}`}
          aria-label={tooltipText ?? seat.letter ?? seat.id}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {seat.letter || seat.id.slice(0, 2)}
        </button>
        {hasBautizo && (
          <span
            className="absolute -right-0.5 top-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#202124]"
            aria-hidden
          />
        )}

        {!menuOpen && tooltipText && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700"
          >
            {tooltipText}
            <span
              className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
              aria-hidden
            />
          </span>
        )}

        {menuOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-40"
                aria-hidden
                onClick={() => setMenuOpen(false)}
              />
              <div
                ref={menuRef}
                role="menu"
                className="fixed z-50 min-w-[5rem] rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#202124]"
                style={{
                  top: menuPosition?.top ?? -9999,
                  left: menuPosition?.left ?? -9999,
                  visibility: menuPosition ? "visible" : "hidden",
                }}
              >
                {occupied && seat.encontrado ? (
                  <div
                    role="none"
                    className="border-b border-gray-100 px-3 py-2 text-xs text-app-text-secondary dark:border-gray-700 dark:text-gray-400"
                  >
                    Asiento ocupado por: {ocupadoPor(seat)}
                  </div>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    if (!seat.id) return;
                    const ok = await copyToClipboard(seat.id);
                    if (ok) toast.success("ID del asiento copiado");
                    else toast.error("No se pudo copiar");
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Copiar ID del asiento
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!seat.encontrado?.id}
                  onClick={async () => {
                    if (!seat.encontrado?.id) return;
                    const ok = await copyToClipboard(seat.encontrado.id);
                    if (ok) toast.success("ID del encontrado copiado");
                    else toast.error("No se pudo copiar el ID del encontrado");
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Copiar ID del encontrado
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={occupied}
                  onClick={() => {
                    setMenuOpen(false);
                    setShowAsignar(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Asignar a otro
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!seat.encontrado?.id}
                  onClick={() => {
                    setAccionBautizo(hasBautizo ? "quitar" : "aplicar");
                    setMenuOpen(false);
                    setShowConfirmBautizo(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {hasBautizo ? "Quitar bautizo" : "Aplicar bautizo"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canDarDeBaja}
                  onClick={() => {
                    setMenuOpen(false);
                    if (canDarDeBaja) setShowConfirm(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Dar de baja
                </button>
              </div>
            </>,
            document.body,
          )}
      </div>

      {showConfirm && (
        <ConfirmDarDeBajaModal
          open={showConfirm}
          ocupadoPor={ocupadoPor(seat)}
          loading={updating}
          onConfirm={handleDarDeBaja}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <ConfirmarBautizoModal
        open={showConfirmBautizo}
        accion={accionBautizo}
        encontrado={seat.encontrado ?? null}
        onSuccess={() => setShowConfirmBautizo(false)}
        onCancel={() => setShowConfirmBautizo(false)}
      />

      {showAsignar && (
        <AsignarAsientoModal
          open={showAsignar}
          seat={{ id: seat.id, letter: seat.letter, team: seat.team }}
          sex={sex}
          onSuccess={() => setShowAsignar(false)}
          onCancel={() => setShowAsignar(false)}
        />
      )}
    </>
  );
}
