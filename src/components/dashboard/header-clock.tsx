"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";

const formatTime = (date: Date) =>
  date.toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Reloj del header: hora y minutos con a.m./p.m. (p. ej. "3:07 p.m."), con la fecha
 * completa al pasar el cursor. Se actualiza justo al cambiar el minuto y al volver a la
 * pestaña, porque el navegador frena los timers de las pestañas en segundo plano. Hasta
 * montarse en el cliente pinta un hueco del mismo ancho, para no desfasar la hora del
 * servidor ni mover el header.
 */
export function HeaderClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      const msToNextMinute =
        60_000 - (current.getSeconds() * 1000 + current.getMilliseconds());
      timer = setTimeout(tick, msToNextMinute + 50);
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      className="hidden shrink-0 items-center gap-1.5 px-1 text-sm font-medium tabular-nums text-app-text-secondary dark:text-gray-300 sm:flex"
      title={now ? formatDate(now) : undefined}
    >
      <HugeiconsIcon icon={Clock01Icon} size={16} className="shrink-0" aria-hidden />
      {now ? (
        <time dateTime={now.toISOString()} aria-label={`Hora actual: ${formatTime(now)}`}>
          {formatTime(now)}
        </time>
      ) : (
        <span className="invisible" aria-hidden>
          00:00 p.m.
        </span>
      )}
    </div>
  );
}
