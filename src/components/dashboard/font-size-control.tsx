"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  persistFontScale,
  readStoredFontScale,
} from "registro/lib/font-scale";

const PANEL_WIDTH_PX = 260;

/**
 * Control de tamaño de texto del header: un botón "AA" que abre un panel con un
 * slider (85%–130%). El botón y el panel van en px (no en rem) y el panel se monta en
 * un portal fijo, para que no cambien de tamaño ni se muevan bajo el cursor mientras
 * el resto del sistema escala.
 */
export function FontSizeControl() {
  const [scale, setScale] = useState(FONT_SCALE_DEFAULT);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setScale(readStoredFontScale());
    setMounted(true);
  }, []);

  const changeScale = (next: number) => {
    setScale(next);
    persistFontScale(next);
  };

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(
        8,
        Math.min(
          rect.right - PANEL_WIDTH_PX,
          window.innerWidth - PANEL_WIDTH_PX - 8,
        ),
      );
      setCoords({ top: rect.bottom + 8, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    sliderRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onViewportChange = () => setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open]);

  const percent = Math.round(scale * 100);
  const fill =
    ((scale - FONT_SCALE_MIN) / (FONT_SCALE_MAX - FONT_SCALE_MIN)) * 100;
  const isDefault = Math.abs(scale - FONT_SCALE_DEFAULT) < 0.001;

  const panel =
    mounted && open
      ? createPortal(
          <div
            ref={panelRef}
            id="font-size-panel"
            role="dialog"
            aria-label="Tamaño de texto"
            className="fixed z-50 rounded-[12px] border border-gray-200 bg-app-sidebar p-[16px] text-[14px] shadow-lg dark:border-gray-700 dark:bg-[#2a2b2e]"
            style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH_PX }}
          >
            <div className="mb-[12px] flex items-baseline justify-between gap-[12px]">
              <p className="font-semibold text-app-text-primary dark:text-white">
                Tamaño de texto
              </p>
              <p className="tabular-nums text-app-text-secondary dark:text-gray-400">
                {percent}%
              </p>
            </div>
            <div className="flex items-center gap-[10px]">
              <span
                aria-hidden
                className="text-[11px] font-semibold leading-none text-app-text-secondary dark:text-gray-400"
              >
                A
              </span>
              <input
                ref={sliderRef}
                type="range"
                min={FONT_SCALE_MIN}
                max={FONT_SCALE_MAX}
                step={FONT_SCALE_STEP}
                value={scale}
                onChange={(e) => changeScale(Number(e.target.value))}
                aria-label="Tamaño de texto"
                aria-valuetext={`${percent} por ciento`}
                className="font-scale-slider min-w-0 flex-1 text-app-primary dark:text-app-primary-muted"
                style={{ ["--fill" as string]: `${fill}%`, touchAction: "none" }}
              />
              <span
                aria-hidden
                className="text-[19px] font-semibold leading-none text-app-text-primary dark:text-white"
              >
                A
              </span>
            </div>
            <button
              type="button"
              onClick={() => changeScale(FONT_SCALE_DEFAULT)}
              disabled={isDefault}
              className="-ml-[6px] mt-[12px] rounded-[6px] px-[6px] py-[4px] text-[12px] font-medium text-app-primary transition-colors hover:bg-app-selected disabled:cursor-default disabled:text-app-text-secondary disabled:hover:bg-transparent dark:text-app-primary-muted dark:hover:bg-white/5 dark:disabled:text-gray-500"
            >
              Restablecer al 100%
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={!mounted}
        title="Tamaño de texto"
        aria-label={`Tamaño de texto: ${percent}%`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? "font-size-panel" : undefined}
        className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg font-semibold leading-none transition-colors hover:bg-app-selected/50 hover:text-app-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary disabled:opacity-60 dark:hover:bg-gray-700 dark:hover:text-app-primary-muted ${
          open
            ? "bg-app-selected text-app-primary dark:bg-gray-700 dark:text-app-primary-muted"
            : "text-app-text-secondary dark:text-gray-300"
        }`}
      >
        <span aria-hidden className="flex items-end gap-px">
          <span className="text-[11px]">A</span>
          <span className="text-[16px]">A</span>
        </span>
      </button>
      {panel}
    </>
  );
}
