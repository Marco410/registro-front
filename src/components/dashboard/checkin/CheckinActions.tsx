"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "registro/constants/routes";
import type { CheckinResultData } from "./checkinResultCard";

export interface CheckinActionsProps {
  resultData: CheckinResultData;
  onNewCheckin: () => void;
}

/**
 * Acciones tras un check-in: hacer otro check-in (Shift+C) e ir a registro (Shift+R).
 */
export function CheckinActions({
  resultData,
  onNewCheckin,
}: CheckinActionsProps) {
  const router = useRouter();
  const onNewCheckinRef = useRef(onNewCheckin);
  const goToRegistroRef = useRef(() => router.push(routes.dashboardRegistro()));
  onNewCheckinRef.current = onNewCheckin;
  goToRegistroRef.current = () => router.push(routes.dashboardRegistro());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "C" || e.key === "c") && e.shiftKey) {
        e.preventDefault();
        onNewCheckinRef.current?.();
      }
      if ((e.key === "R" || e.key === "r") && e.shiftKey) {
        e.preventDefault();
        goToRegistroRef.current?.();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const isHombre = resultData.sexo === "H";

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
      <p className="mb-3 text-sm font-medium text-app-text-primary dark:text-gray-300">
        Acciones
      </p>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col items-start">
          <button
            type="button"
            onClick={onNewCheckin}
            className="rounded-lg border border-green-300 bg-white px-4 py-2.5 text-sm font-medium text-green-600 shadow-sm transition-colors hover:bg-green-50 dark:border-green-600 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
          >
            Hacer otro check-in
          </button>
          <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
            <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
              Shift
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
              C
            </kbd>
          </span>
        </div>
        <div className="flex flex-col items-start">
          <Link
            href={routes.dashboardRegistro()}
            className={`inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
              isHombre
                ? "border-app-primary bg-white text-app-primary hover:bg-app-primary/10 dark:border-app-primary-muted dark:bg-transparent dark:text-app-primary-muted dark:hover:bg-app-primary-muted/20"
                : "border-pink-500 bg-white text-pink-600 hover:bg-pink-500/10 dark:border-pink-400 dark:bg-transparent dark:text-pink-400 dark:hover:bg-pink-500/20"
            }`}
          >
            Ir a registro (nuevo encontrado)
          </Link>
          <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
            <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
              Shift
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">
              R
            </kbd>
          </span>
        </div>
      </div>
    </section>
  );
}
