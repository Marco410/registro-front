"use client";

import { memo, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@apollo/client";
import { Seat, SEATS_QUERY } from "registro/graphql/aforo/queries";
import {
  REMOVE_CHECKIN_MUTATION,
  type RemoveCheckinResponse,
  type RemoveCheckinVariables,
} from "registro/graphql/checkin/mutations";
import { ConfirmDarDeBajaModal } from "registro/components/dashboard/aforo/ConfirmDarDeBajaModal";
import { ConfirmQuitarCheckinModal } from "registro/components/dashboard/aforo/ConfirmQuitarCheckinModal";
import { ConfirmarBautizoModal } from "registro/components/dashboard/aforo/ConfirmarBautizoModal";
import { AsignarAsientoModal } from "registro/components/dashboard/aforo/AsignarAsientoModal";
import { darDeBajaSeat, useSeatUpdate } from "./seat-update-context";
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

function SeatBoxComponent({ seat, sex }: SeatBoxProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmQuitarCheckin, setShowConfirmQuitarCheckin] = useState(false);
  const [showConfirmBautizo, setShowConfirmBautizo] = useState(false);
  const [accionBautizo, setAccionBautizo] = useState<"aplicar" | "quitar">(
    "aplicar",
  );
  const [showAsignar, setShowAsignar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { updateSeat } = useSeatUpdate();
  const [removeCheckin, { loading: removingCheckin }] = useMutation<
    RemoveCheckinResponse,
    RemoveCheckinVariables
  >(REMOVE_CHECKIN_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
  });

  const occupied = seat.occupied;
  const abandoned = seat.abandoned;
  const isMale = sex === "H";
  const canDarDeBaja = occupied && seat.encontrado?.id && !abandoned;

  const seatInteractionClass =
    "transform-gpu transition-none hover:scale-110 hover:z-10 active:scale-95";

  const filledClass = abandoned
    ? "border-gray-400/50 bg-gray-500 text-white shadow-sm hover:border-gray-400/70 hover:bg-gray-600 dark:border-gray-500/55 dark:bg-gray-600"
    : occupied
      ? isMale
        ? "border-app-primary/45 bg-app-primary text-white shadow-sm hover:border-app-primary/65 hover:bg-app-primary/95 dark:border-app-primary-muted/50 dark:bg-app-primary-muted"
        : "border-pink-400/45 bg-pink-500 text-white shadow-sm hover:border-pink-400/65 hover:bg-pink-600 dark:border-pink-400/50 dark:bg-pink-500"
      : isMale
        ? "border-gray-300 bg-gray-50 text-app-text-secondary shadow-sm hover:border-app-primary/40 hover:bg-app-primary/10 hover:text-app-primary dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-app-primary-muted/45 dark:hover:bg-app-primary/15 dark:hover:text-app-primary-muted"
        : "border-gray-300 bg-gray-50 text-app-text-secondary shadow-sm hover:border-pink-400/40 hover:bg-pink-500/10 hover:text-pink-600 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-pink-400/45 dark:hover:bg-pink-500/15 dark:hover:text-pink-400";

  const focusRingClass = isMale
    ? "focus:ring-app-primary/40 dark:focus:ring-app-primary-muted/40"
    : "focus:ring-pink-400/40";

  const tooltipText = abandoned
    ? seat.abandonedBy
      ? `Baja: ${seat.abandonedBy.nombre} ${seat.abandonedBy.apellido_p} ${seat.abandonedBy.apellido_m}`
      : "Dado de baja"
    : occupied && seat.encontrado
      ? `${seat.encontrado.nombre} ${seat.encontrado.apellido_p} ${seat.encontrado.apellido_m} | ${seat.gender}${seat.team?.teamNumber}${seat.letter} | Edad: ${seat.encontrado.edad}`
      : null;

  const handleDarDeBaja = async () => {
    setIsSubmitting(true);
    try {
      await darDeBajaSeat(updateSeat, seat);
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuitarCheckin = async () => {
    if (!seat.encontrado?.id) return;
    try {
      const { data } = await removeCheckin({
        variables: { encontradoId: seat.encontrado.id },
      });
      if (data?.removeCheckin.success) {
        toast.success("Check-in quitado");
        setShowConfirmQuitarCheckin(false);
      } else {
        toast.error("No se pudo quitar el check-in");
      }
    } catch {
      toast.error("No se pudo quitar el check-in");
    }
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
      <div className="relative inline-flex">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          title={menuOpen ? undefined : (tooltipText ?? undefined)}
          className={`flex shrink-0 cursor-pointer items-center justify-center rounded border ${SEAT_SIZE} ${SEAT_TEXT} font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${seatInteractionClass} ${focusRingClass} ${filledClass}`}
          aria-label={tooltipText ?? seat.letter ?? seat.id}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {seat.letter || seat.id.slice(0, 2)}
        </button>
        {hasBautizo && (
          <span
            className="absolute -right-0 top-1 h-2 w-2 -translate-y-1/2 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#202124]"
            aria-hidden
          />
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
                    Asiento ocupado por: {ocupadoPor(seat)} | Edad: {seat.encontrado?.edad}
                  </div>
                ) :  <div
                    role="none"
                    className="border-b border-gray-100 px-3 py-2 text-xs text-app-text-secondary dark:border-gray-700 dark:text-gray-400"
                  >
                    Asiento desocupado
                  </div>}
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
                {seat.encontrado?.id ? (
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
                ) : null}
                {occupied && seat.encontrado?.id ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowConfirmQuitarCheckin(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-orange-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Quitar Checkin
                  </button>
                ) : null}
                {!occupied && !seat.encontrado?.id ? (
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
                ) : null}
                {seat.encontrado?.id ? (
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
                ) : null}
                {seat.encontrado?.id ? (
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
                ) : null}
              </div>
            </>,
            document.body,
          )}
      </div>
      {showConfirm && (
        <ConfirmDarDeBajaModal
          open={showConfirm}
          ocupadoPor={ocupadoPor(seat)}
          loading={isSubmitting}
          onConfirm={handleDarDeBaja}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showConfirmQuitarCheckin && (
        <ConfirmQuitarCheckinModal
          open={showConfirmQuitarCheckin}
          ocupadoPor={ocupadoPor(seat)}
          loading={removingCheckin}
          onConfirm={handleQuitarCheckin}
          onCancel={() => setShowConfirmQuitarCheckin(false)}
        />
      )}

      {showConfirmBautizo && (
        <ConfirmarBautizoModal
          open={showConfirmBautizo}
          accion={accionBautizo}
          encontrado={seat.encontrado ?? null}
          onSuccess={() => setShowConfirmBautizo(false)}
          onCancel={() => setShowConfirmBautizo(false)}
        />
      )}

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

function seatPropsAreEqual(prev: SeatBoxProps, next: SeatBoxProps) {
  if (prev.sex !== next.sex) return false;
  const a = prev.seat;
  const b = next.seat;
  if (a.id !== b.id) return false;
  if (
    a.letter !== b.letter ||
    a.occupied !== b.occupied ||
    a.abandoned !== b.abandoned ||
    a.gender !== b.gender
  ) {
    return false;
  }
  const ae = a.encontrado;
  const be = b.encontrado;
  if (!ae && !be) return true;
  if (!ae || !be) return false;
  return (
    ae.id === be.id &&
    ae.nombre === be.nombre &&
    ae.apellido_p === be.apellido_p &&
    ae.apellido_m === be.apellido_m &&
    ae.bautizo === be.bautizo &&
    ae.edad === be.edad
  );
}

export const SeatBox = memo(SeatBoxComponent, seatPropsAreEqual);
