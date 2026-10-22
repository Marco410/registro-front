import type { AforoResponse } from "registro/graphql/aforo/queries";

export interface ConteoPorSexo {
  total: number;
  hombres: number;
  mujeres: number;
}

/**
 * Personas en el retiro y bajas a partir de AFORO_QUERY.
 * En el retiro = check-ins − bajas (nunca negativo).
 */
export function getAforoCounts(data: AforoResponse | undefined): {
  enRetiro: ConteoPorSexo;
  bajas: ConteoPorSexo;
} {
  const c = data ?? {
    checkinsCount: 0,
    checkinsCountH: 0,
    checkinsCountM: 0,
    bajasCount: 0,
    bajasCountH: 0,
    bajasCountM: 0,
  };
  return {
    enRetiro: {
      total: Math.max(0, c.checkinsCount - c.bajasCount),
      hombres: Math.max(0, c.checkinsCountH - c.bajasCountH),
      mujeres: Math.max(0, c.checkinsCountM - c.bajasCountM),
    },
    bajas: {
      total: c.bajasCount,
      hombres: c.bajasCountH,
      mujeres: c.bajasCountM,
    },
  };
}
