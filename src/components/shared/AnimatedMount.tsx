"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface AnimatedMountProps {
  show: boolean;
  children: ReactNode;
  className?: string;
  /** Al cambiar, vuelve a ejecutar la animación de entrada aunque `show` siga en true. */
  animationKey?: string | number;
}

/**
 * Monta/desmonta hijos con transición de opacidad y desplazamiento vertical.
 */
export function AnimatedMount({
  show,
  children,
  className,
  animationKey,
}: AnimatedMountProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      return;
    }

    setShouldRender(true);
    setIsVisible(false);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [show, animationKey]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") return;
    if (!show) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={[
        "transform-gpu transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-3 scale-[0.98] opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}
