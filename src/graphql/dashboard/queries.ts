import { gql } from "@apollo/client";

/**
 * Conteos para el dashboard: totales y por sexo (H/M).
 * Totales globales sin where; por sexo con where.
 */
export const DASHBOARD_COUNTS_QUERY = gql`
  query DashboardCounts {
    encontradosCount
    checkinsCount
    encontradosCountH: encontradosCount(where: { sexo: { equals: "H" } })
    encontradosCountM: encontradosCount(where: { sexo: { equals: "M" } })
    checkinsCountH: checkinsCount(where: { encontrado: { sexo: { equals: "H" } } })
    checkinsCountM: checkinsCount(where: { encontrado: { sexo: { equals: "M" } } })
  }
`;

export interface DashboardCountsResponse {
  encontradosCount: number;
  checkinsCount: number;
  encontradosCountH: number;
  encontradosCountM: number;
  checkinsCountH: number;
  checkinsCountM: number;
}
