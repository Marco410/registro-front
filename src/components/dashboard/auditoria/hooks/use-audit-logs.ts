"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  AUDIT_LOGS_QUERY,
  buildAuditWhere,
  type AuditLogFilters,
  type AuditLogsQueryResponse,
  type AuditLogsQueryVariables,
} from "registro/graphql/auditoria/queries";

export const AUDIT_PAGE_SIZE = 25;

/**
 * Página de la bitácora de auditoría según los filtros. Mientras carga una página nueva
 * conserva la anterior (`previousData`) para que la tabla no parpadee.
 * Es solo lectura, así que no muestra toasts.
 * @param filters Filtros de la página
 * @param page Página actual (desde 1)
 */
export function useAuditLogs(filters: AuditLogFilters, page: number) {
  const take = AUDIT_PAGE_SIZE;
  const skip = (page - 1) * take;
  const where = useMemo(() => buildAuditWhere(filters), [filters]);

  const { data, previousData, loading, error, refetch } = useQuery<
    AuditLogsQueryResponse,
    AuditLogsQueryVariables
  >(AUDIT_LOGS_QUERY, {
    variables: { where, take, skip },
    notifyOnNetworkStatusChange: true,
  });

  const current = data ?? previousData;

  return {
    logs: current?.auditLogs ?? [],
    total: current?.auditLogsCount ?? 0,
    take,
    skip,
    loading,
    error,
    refetch,
  };
}
