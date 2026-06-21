"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  BAJAS_ENCONTRADO_IDS_QUERY,
  type BajasEncontradoIdsResponse,
  type BajasEncontradoIdsVariables,
} from "registro/graphql/aforo/queries";

export const WHERE_CON_CHECKINS = { checkins: { id: { not: null } } };

export function buildEncontradosWhere(sex?: "H" | "M" | null) {
  return {
    ...WHERE_CON_CHECKINS,
    ...(sex ? { sexo: { equals: sex } } : {}),
  };
}

function buildBajasSeatsWhere(sex?: "H" | "M" | null): BajasEncontradoIdsVariables["where"] {
  return {
    abandonedBy: { id: { not: null } },
    ...(sex ? { gender: { equals: sex } } : {}),
  };
}

/** IDs de encontrados dados de baja, alineado con bajasCount del aforo. */
export function useBajaEncontradoIds(sex?: "H" | "M" | null) {
  const { data, loading, error } = useQuery<
    BajasEncontradoIdsResponse,
    BajasEncontradoIdsVariables
  >(BAJAS_ENCONTRADO_IDS_QUERY, {
    variables: { where: buildBajasSeatsWhere(sex) },
    pollInterval: 10000,
  });

  const bajaIds = useMemo(() => {
    const ids = new Set<string>();
    for (const seat of data?.seats ?? []) {
      const id = seat.abandonedBy?.id;
      if (id) ids.add(id);
    }
    return ids;
  }, [data]);

  return { bajaIds, loading, error };
}

export function filterEncontradosEnForo<T extends { id: string }>(
  encontrados: T[],
  bajaIds: Set<string>,
): T[] {
  return encontrados.filter((e) => !bajaIds.has(e.id));
}
