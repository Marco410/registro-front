"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import type { AuditLogItem } from "registro/graphql/auditoria/queries";
import { formatDateTime } from "registro/lib/helpers/date-format";
import {
  fieldLabel,
  formatAuditValue,
  metadataLabel,
} from "./constants";

const sectionTitle =
  "mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-app-text-secondary dark:text-gray-400";

/** Pares campo/valor de un registro borrado, sin las FK internas (`teamId`, …). */
function deletedFields(value: unknown): Array<[string, unknown]> {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).filter(
    ([key, v]) => !key.endsWith("Id") && v !== null && v !== "",
  );
}

export interface AuditoriaDetailProps {
  log: AuditLogItem;
}

/**
 * Detalle de una entrada de la bitácora: error, campos que cambiaron (antes → después),
 * datos extra y datos técnicos de la petición.
 */
export function AuditoriaDetail({ log }: AuditoriaDetailProps) {
  const changes = Object.entries(log.changes ?? {});
  const { registroEliminado, ...metadata } = log.metadata ?? {};
  const metadataEntries = Object.entries(metadata);
  const deleted = deletedFields(registroEliminado);

  return (
    <div className="space-y-4 px-4 py-4 text-sm">
      {log.status === "error" && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <HugeiconsIcon icon={AlertCircleIcon} size={18} className="mt-0.5 shrink-0" />
          <span>{log.errorMessage || "La acción falló"}</span>
        </div>
      )}

      {changes.length > 0 && (
        <div>
          <p className={sectionTitle}>Cambios</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Campo
                  </th>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Antes
                  </th>
                  <th className="px-3 py-2 font-semibold text-app-text-primary dark:text-gray-300">
                    Después
                  </th>
                </tr>
              </thead>
              <tbody>
                {changes.map(([key, change]) => (
                  <tr
                    key={key}
                    className="border-b border-gray-100 last:border-b-0 dark:border-gray-700/80"
                  >
                    <td className="px-3 py-2 font-medium text-app-text-primary dark:text-gray-200">
                      {fieldLabel(key)}
                    </td>
                    {/* Sin `antes` (roles, contraseña) no se conoce el valor anterior */}
                    <td
                      className={`px-3 py-2 ${
                        change.antes === undefined
                          ? "text-app-text-secondary dark:text-gray-400"
                          : "text-red-700 line-through decoration-red-300 dark:text-red-300 dark:decoration-red-700"
                      }`}
                    >
                      {formatAuditValue(change.antes)}
                    </td>
                    <td className="px-3 py-2 text-green-700 dark:text-green-300">
                      {formatAuditValue(change.despues)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {metadataEntries.length > 0 && (
        <div>
          <p className={sectionTitle}>Datos</p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {metadataEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-app-text-secondary dark:text-gray-400">
                  {metadataLabel(key)}:
                </dt>
                <dd className="text-app-text-primary dark:text-gray-200">
                  {formatAuditValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {deleted.length > 0 && (
        <div>
          <p className={sectionTitle}>{metadataLabel("registroEliminado")}</p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {deleted.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-app-text-secondary dark:text-gray-400">
                  {fieldLabel(key)}:
                </dt>
                <dd className="text-app-text-primary dark:text-gray-200">
                  {formatAuditValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-200 pt-3 text-xs text-app-text-secondary dark:border-gray-700 dark:text-gray-400">
        <span>{formatDateTime(log.createdAt)}</span>
        {log.ip && <span>IP {log.ip}</span>}
        {log.entityType && (
          <span>
            {log.entityType}
            {log.entityId ? ` #${log.entityId}` : ""}
          </span>
        )}
        {log.userAgent && (
          <span className="break-all" title={log.userAgent}>
            {log.userAgent}
          </span>
        )}
      </div>
    </div>
  );
}
