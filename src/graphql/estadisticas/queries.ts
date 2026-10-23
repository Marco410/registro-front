import { gql } from "@apollo/client";

/**
 * Todo lo que usa la página de estadísticas en una sola consulta: los encontrados con
 * los campos que se agregan y los encontrados dados de baja (por asiento abandonado).
 * Los cálculos se hacen en el cliente (`registro/lib/helpers/estadisticas`), así todas
 * las gráficas salen del mismo conjunto de datos.
 */
export const ESTADISTICAS_QUERY = gql`
  query Estadisticas {
    encontrados {
      id
      sexo
      edad
      estado_c
      religion
      celular
      medicamento
      enfermedad
      bautizo
      create_at
      checkins {
        checkinAt
      }
    }
    bajas: seats(where: { abandonedBy: { id: { not: null } } }) {
      abandonedBy {
        id
      }
    }
  }
`;

export interface EstadisticaEncontrado {
  id: string;
  sexo: string;
  edad: number | null;
  estado_c: string | null;
  religion: string | null;
  celular: boolean;
  medicamento: boolean;
  enfermedad: string | null;
  bautizo: boolean;
  create_at: string | null;
  checkins: { checkinAt: string | null } | null;
}

export interface EstadisticasQueryResponse {
  encontrados: EstadisticaEncontrado[];
  bajas: { abandonedBy: { id: string } | null }[];
}
