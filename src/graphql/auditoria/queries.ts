import { gql } from "@apollo/client";
import { dayRangeToIso } from "registro/lib/helpers/date-format";

/**
 * Query de la bitácora de auditoría, paginada y filtrada por where.
 * El backend solo la responde a usuarios admin; a los demás les devuelve una lista vacía.
 */
export const AUDIT_LOGS_QUERY = gql`
  query AuditLogs($where: AuditLogWhereInput!, $take: Int, $skip: Int) {
    auditLogs(
      where: $where
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      action
      username
      userFullName
      user {
        id
      }
      entityType
      entityId
      entityLabel
      changes
      metadata
      status
      errorMessage
      ip
      userAgent
      createdAt
    }
    auditLogsCount(where: $where)
  }
`;

/** Un campo que cambió: valores antes y después (sin `antes` cuando no se conoce). */
export interface AuditChange {
  antes?: unknown;
  despues?: unknown;
}

export interface AuditLogItem {
  id: string;
  action: string;
  username: string;
  userFullName: string;
  user: { id: string } | null;
  entityType: string;
  entityId: string;
  entityLabel: string;
  changes: Record<string, AuditChange> | null;
  metadata: Record<string, unknown> | null;
  status: "exito" | "error";
  errorMessage: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogsQueryResponse {
  auditLogs: AuditLogItem[];
  auditLogsCount: number;
}

/** Filtros de la página de Auditoría. Un valor vacío significa "todos". */
export interface AuditLogFilters {
  userId: string;
  actions: string[];
  /** YYYY-MM-DD */
  desde: string;
  /** YYYY-MM-DD */
  hasta: string;
  search: string;
  status: "" | "exito" | "error";
}

export const EMPTY_AUDIT_FILTERS: AuditLogFilters = {
  userId: "",
  actions: [],
  desde: "",
  hasta: "",
  search: "",
  status: "",
};

type AuditLogCondition = Record<string, unknown>;

export interface AuditLogsQueryVariables {
  where: { AND?: AuditLogCondition[] };
  take?: number;
  skip?: number;
}

/**
 * Arma el `where` de AUDIT_LOGS_QUERY a partir de los filtros de la página.
 * La búsqueda es por texto en el registro afectado y en el nombre o username del usuario.
 */
export function buildAuditWhere(
  filters: AuditLogFilters,
): AuditLogsQueryVariables["where"] {
  const and: AuditLogCondition[] = [];

  if (filters.userId) and.push({ user: { id: { equals: filters.userId } } });
  if (filters.actions.length > 0) and.push({ action: { in: filters.actions } });
  if (filters.status) and.push({ status: { equals: filters.status } });

  const { gte, lte } = dayRangeToIso(filters.desde, filters.hasta);
  if (gte || lte) {
    and.push({ createdAt: { ...(gte && { gte }), ...(lte && { lte }) } });
  }

  const search = filters.search.trim();
  if (search) {
    const contains = { contains: search, mode: "insensitive" };
    and.push({
      OR: [
        { entityLabel: contains },
        { username: contains },
        { userFullName: contains },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}
