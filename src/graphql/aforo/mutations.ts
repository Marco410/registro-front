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

/** Variables para dar de baja (abandoned). */
export interface UpdateSeatDarDeBajaVariables {
  where: { id: string };
  data: {
    abandoned: boolean;
    occupied: boolean;
    abandonedBy: { connect: { id: string } };
  };
}

/** Variables para asignar un encontrado al asiento. */
export interface UpdateSeatAsignarVariables {
  where: { id: string };
  data: {
    encontrado: { connect: { id: string } };
    occupied: boolean;
    abandoned?: boolean;
    abandonedBy?: { disconnect?: boolean };
  };
}

export type UpdateSeatVariables =
  | UpdateSeatDarDeBajaVariables
  | UpdateSeatAsignarVariables;

/** Crear foráneo bautizado. */
export const CREATE_BAUTIZO_FORANEO_MUTATION = gql`
  mutation CreateBautizoForaneo($data: BautizoForaneoCreateInput!) {
    createBautizoForaneo(data: $data) {
      id
      nombre
      apellido_p
      apellido_m
      gender
      telefono
      notes
      create_at
      update_at
    }
  }
`;

/** Eliminar foráneo bautizado. */
export const DELETE_BAUTIZO_FORANEO_MUTATION = gql`
  mutation DeleteBautizoForaneo($where: BautizoForaneoWhereUniqueInput!) {
    deleteBautizoForaneo(where: $where) {
      id
    }
  }
`;
