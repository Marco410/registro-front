"use client";

import { Fragment, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { AuditLogItem } from "registro/graphql/auditoria/queries";
import { formatDateTime } from "registro/lib/helpers/date-format";
import {
  AUDIT_CATEGORIAS,
  fieldLabel,
  getAuditAction,
} from "./constants";
import { AuditoriaDetail } from "./AuditoriaDetail";

const COLUMNS = 7;

const stripAsiento = (value: unknown) =>
  String(value ?? "").replace(/^Asiento\s+/, "");

/** Resumen de una línea para la columna Detalle. */
function summarizeLog(log: AuditLogItem): string {
  if (log.status === "error") return log.errorMessage || "Falló";

  const fields = Object.keys(log.changes ?? {});
  if (fields.length > 0) {
    const shown = fields.slice(0, 3).map(fieldLabel).join(", ");
    const rest = fields.length > 3 ? ` y ${fields.length - 3} más` : "";
    return `${shown}${rest}`;
  }

  const m = log.metadata ?? {};
  if (m.asientoAnterior || m.asientoNuevo) {
    return `${stripAsiento(m.asientoAnterior) || "—"} → ${stripAsiento(m.asientoNuevo) || "—"}`;
  }
  if (m.yaTeniaCheckin) return "Ya tenía check-in";
  if (m.sinLugar) return "Sin lugar disponible";
  if (m.asiento) {
    return [`Asiento ${m.asiento}`, m.equipo].filter(Boolean).join(" · ");
  }
  if (Array.isArray(m.eventosDesactivados) && m.eventosDesactivados.length > 0) {
    return `Desactivó: ${m.eventosDesactivados.join(", ")}`;
  }
  return "—";
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr
          key={i}
          className="border-b border-gray-100 last:border-b-0 dark:border-gray-700/80"
          aria-hidden
        >
          {Array.from({ length: COLUMNS - 1 }, (_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-3/4 max-w-[160px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </td>
          ))}
          <td />
        </tr>
      ))}
    </>
  );
}

export interface AuditoriaTableProps {
  logs: AuditLogItem[];
  total: number;
  page: number;
  take: number;
  skip: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Tabla paginada de la bitácora. Cada fila se expande para ver el detalle
 * (cambios antes → después, datos extra, IP y user agent).
 */
export function AuditoriaTable({
  logs,
  total,
  page,
  take,
  skip,
  loading,
  onPageChange,
}: AuditoriaTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / take));
  const showSkeleton = loading && logs.length === 0;

  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {loading && logs.length > 0 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 dark:bg-gray-900/60"
            aria-hidden="true"
          >
            <span className="text-sm font-medium text-app-text-secondary dark:text-gray-400">
              Cargando…
            </span>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] bg-white text-left text-sm dark:bg-gray-900">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Fecha y hora
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Usuario
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Acción
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Sobre
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  Detalle
                </th>
                <th className="px-4 py-3 font-semibold text-app-text-primary dark:text-gray-300">
                  IP
                </th>
                <th className="w-10 px-2 py-3">
                  <span className="sr-only">Ver detalle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {showSkeleton ? (
                <TableSkeleton rows={8} />
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS}
                    className="px-4 py-8 text-center text-sm text-app-text-secondary dark:text-gray-400"
                  >
                    No hay actividad con estos filtros
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const action = getAuditAction(log.action);
                  const categoria = AUDIT_CATEGORIAS[action.categoria];
                  const expanded = expandedId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <tr
                        onClick={() => toggle(log.id)}
                        className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700/80 dark:hover:bg-gray-800/50 ${
                          expanded ? "bg-gray-50 dark:bg-gray-800/50" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-app-text-secondary dark:text-gray-400">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-app-text-primary dark:text-gray-200">
                            {log.userFullName || log.username || "—"}
                          </p>
                          {log.userFullName && log.username && (
                            <p className="text-xs text-app-text-secondary dark:text-gray-400">
                              {log.username}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${categoria.badgeClass}`}
                          >
                            <HugeiconsIcon icon={categoria.icon} size={14} />
                            {action.label}
                          </span>
                          {log.status === "error" && (
                            <span className="ml-1.5 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Error
                            </span>
                          )}
                        </td>
                        <td className="max-w-[260px] px-4 py-3 text-app-text-primary dark:text-gray-200">
                          <span className="line-clamp-2">{log.entityLabel || "—"}</span>
                        </td>
                        <td className="max-w-[240px] px-4 py-3 text-app-text-secondary dark:text-gray-400">
                          <span className="line-clamp-2">{summarizeLog(log)}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-app-text-secondary dark:text-gray-400">
                          {log.ip || "—"}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(log.id);
                            }}
                            aria-expanded={expanded}
                            aria-label={expanded ? "Ocultar detalle" : "Ver detalle"}
                            className="rounded-md p-1 text-app-text-secondary transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            <HugeiconsIcon
                              icon={ArrowDown01Icon}
                              size={16}
                              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-700/80 dark:bg-gray-800/30">
                          <td colSpan={COLUMNS}>
                            <AuditoriaDetail log={log} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-app-text-secondary dark:text-gray-400">
            {skip + 1}-{Math.min(skip + take, total)} de {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              aria-label="Página anterior"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
              Anterior
            </button>
            <span className="px-2 text-xs text-app-text-secondary dark:text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-app-text-primary hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              aria-label="Página siguiente"
            >
              Siguiente
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
