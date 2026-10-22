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

/** Crear varios asientos (de uno o varios equipos) en una sola petición. */
export const CREATE_SEATS_MUTATION = gql`
  mutation CreateSeats($data: [SeatCreateInput!]!) {
    createSeats(data: $data) {
      id
      letter
      gender
    }
  }
`;

export interface CreateSeatInput {
  letter: string;
  gender: "H" | "M";
  team: { connect: { id: string } };
}

export interface CreateSeatsVariables {
  data: CreateSeatInput[];
}

export interface CreateSeatsResponse {
  createSeats: { id: string; letter: string; gender: string }[];
}

/** Eliminar varios asientos por id. */
export const DELETE_SEATS_MUTATION = gql`
  mutation DeleteSeats($where: [SeatWhereUniqueInput!]!) {
    deleteSeats(where: $where) {
      id
    }
  }
`;

export interface DeleteSeatsVariables {
  where: { id: string }[];
}

export interface DeleteSeatsResponse {
  deleteSeats: { id: string }[];
}

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
