import { gql } from "@apollo/client";

/**
 * Mutación para marcar un asiento como dado de baja (abandoned).
 * Actualiza: abandoned = true, occupied = false, abandonedBy = connect(encontradoId).
 */
export const UPDATE_SEAT_MUTATION = gql`
  mutation UpdateSeat($where: SeatWhereUniqueInput!, $data: SeatUpdateInput!) {
    updateSeat(where: $where, data: $data) {
      id
      letter
      occupied
      abandoned
      abandonedBy {
        nombre
        apellido_p
        apellido_m
        sexo
      }
      encontrado {
        id
        nombre
        apellido_p
        apellido_m
        sexo
      }
    }
  }
`;

export interface UpdateSeatVariables {
  where: { id: string };
  data: {
    abandoned: boolean;
    occupied: boolean;
    abandonedBy: { connect: { id: string } };
  };
}
