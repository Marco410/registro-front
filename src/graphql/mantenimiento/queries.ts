import { gql } from "@apollo/client";

/**
 * Datos de la página Base de datos: grupos de edad (en el orden en que los crea el seed)
 * con sus equipos actuales, y los conteos de lo que se puede limpiar.
 */
export const MANTENIMIENTO_QUERY = gql`
  query Mantenimiento {
    ageGroups(orderBy: [{ created_at: asc }, { id: asc }]) {
      id
      label
      minAge
      maxAge
      maxTeams
      teamsCount
    }
    teamsCount
    seatsCount
    seatsUsadosCount: seatsCount(
      where: {
        OR: [{ occupied: { equals: true } }, { abandoned: { equals: true } }]
      }
    )
    checkinsCount
    encontradosCount
    encontradosBautizadosCount: encontradosCount(
      where: { bautizo: { equals: true } }
    )
    bautizoForaneosCount
    auditLogsCount
  }
`;

export interface MantenimientoAgeGroup {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  maxTeams: number;
  teamsCount: number;
}

export interface MantenimientoQueryResponse {
  ageGroups: MantenimientoAgeGroup[];
  teamsCount: number;
  seatsCount: number;
  seatsUsadosCount: number;
  checkinsCount: number;
  encontradosCount: number;
  encontradosBautizadosCount: number;
  bautizoForaneosCount: number;
  auditLogsCount: number;
}
