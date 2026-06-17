"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type GlassModalZIndex = 50 | 60 | 70;

export interface GlassModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  panelClassName?: string;
  zIndex?: GlassModalZIndex;
  disableBackdropClose?: boolean;
}

const zIndexClass: Record<GlassModalZIndex, string> = {
  50: "z-50",
  60: "z-[60]",
  70: "z-[70]",
};

let scrollLockCount = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";

function lockPageScroll() {
  if (scrollLockCount === 0) {
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    savedBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  scrollLockCount += 1;
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;
  }
}

/**
 * Modal con overlay y panel glassmorphism, portal al body y animación de entrada/salida.
 */
export function GlassModal({
  open,
  onClose,
  children,
  ariaLabelledBy,
  panelClassName,
  zIndex = 60,
  disableBackdropClose = false,
}: GlassModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }

    setShouldRender(true);
    setIsVisible(false);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;

    lockPageScroll();
    return () => unlockPageScroll();
  }, [shouldRender]);

  const handleOverlayTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") return;
    if (!open) setShouldRender(false);
  };

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      className={[
        "fixed inset-0 overflow-y-auto overscroll-contain bg-gray-900/45 p-4 backdrop-blur-md transition-opacity duration-300 ease-out",
        zIndexClass[zIndex],
        isVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      onClick={() => {
        if (!disableBackdropClose && onClose) onClose();
      }}
      onTransitionEnd={handleOverlayTransitionEnd}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className={[
            "my-auto w-full min-h-0 max-h-[min(94vh,calc(100dvh-2rem))] transform-gpu rounded-2xl border border-white/35 bg-white/90 shadow-2xl shadow-black/15 backdrop-blur-xl transition-all duration-300 ease-out dark:border-white/10 dark:bg-[#202124]/75 dark:shadow-black/50",
            isVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-[0.98] opacity-0",
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
