import { gql } from "@apollo/client";

/**
 * Conteos para el dashboard: totales y por sexo (H/M).
 * Totales globales sin where; por sexo con where.
 */
export const DASHBOARD_COUNTS_QUERY = gql`
  query DashboardCounts {
    encontradosCount
    encontradosCountH: encontradosCount(where: { sexo: { equals: "H" } })
    encontradosCountM: encontradosCount(where: { sexo: { equals: "M" } })
  }
`;

export interface DashboardCountsResponse {
  encontradosCount: number;
  encontradosCountH: number;
  encontradosCountM: number;
}
