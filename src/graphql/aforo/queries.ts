import { gql } from "@apollo/client";

/**
 * Query para listar todos los asientos con asignación y equipo.
 */
export const SEATS_QUERY = gql`
  query Seats {
    seats(orderBy: { letter: asc }) {
      id
      letter
      occupied
      gender
      abandoned
      abandonedBy {
        nombre
        apellido_p
        apellido_m
      }
      encontrado {
        id
        nombre
        apellido_p
        apellido_m
        sexo
        telefono
        celular
        medicamento
        bautizo
        edad
        fecha_n
        nom_ref
        tel_ref
        checkins {
          claveOld
        }
      }
      team {
        id
        teamName
        teamNumber
        order
        captain
        auxiliar1
        auxiliar2
        auxiliar3
        captain_h
        auxiliar1_h
        auxiliar2_h
        auxiliar3_h
        ageGroup {
          label
        }
      }
    }
  }
`;

export interface SeatEncontrado {
  id: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  edad: number;
  sexo: string;
  telefono?: string | null;
  celular: boolean;
  medicamento: boolean;
  bautizo: boolean;
  fecha_n?: string | null;
  nom_ref?: string | null;
  tel_ref?: string | null;
  checkins: {
    claveOld: string;
  };
}

export interface SeatTeam {
  id: string;
  teamName: string;
  teamNumber: number;
  order?: number | null;
  captain?: string | null;
  auxiliar1?: string | null;
  auxiliar2?: string | null;
  auxiliar3?: string | null;
  captain_h?: string | null;
  auxiliar1_h?: string | null;
  auxiliar2_h?: string | null;
  auxiliar3_h?: string | null;
  ageGroup: { label: string };
}

export interface SeatAbandonedBy {
  nombre: string;
  apellido_p: string;
  apellido_m: string;
}

export interface Seat {
  id: string;
  letter: string;
  occupied: boolean;
  gender: string;
  abandoned: boolean;
  abandonedBy: SeatAbandonedBy | null;
  encontrado: SeatEncontrado | null;
  team: SeatTeam | null;
}

export interface SeatsQueryResponse {
  seats: Seat[];
}

/** Lista de equipos para asignar asientos. */
export const TEAMS_QUERY = gql`
  query Teams {
    teams(orderBy: { order: asc }) {
      id
      teamNumber
      teamName
      order
      ageGroup {
        label
      }
    }
  }
`;

export interface TeamListItem {
  id: string;
  teamNumber: number;
  teamName: string;
  order?: number | null;
  ageGroup: { label: string } | null;
}

export interface TeamsQueryResponse {
  teams: TeamListItem[];
}

export const AFORO_QUERY = gql`
  query DashboardCounts {
    encontradosCount
    encontradosCountH: encontradosCount(where: { sexo: { equals: "H" } })
    encontradosCountM: encontradosCount(where: { sexo: { equals: "M" } })
    checkinsCount
    checkinsCountH: checkinsCount(
      where: { encontrado: { sexo: { equals: "H" } } }
    )
    checkinsCountM: checkinsCount(
      where: { encontrado: { sexo: { equals: "M" } } }
    )
  }
`;

export interface AforoResponse {
  checkinsCount: number;
  checkinsCountH: number;
  checkinsCountM: number;
  encontradosCount: number;
  encontradosCountH: number;
  encontradosCountM: number;
}

export const BAUTIZO_COUNTS_QUERY = gql`
  query BautizoCounts {
    encontradosBautizoCount: encontradosCount(
      where: { bautizo: { equals: true } }
    )
    encontradosBautizoCountH: encontradosCount(
      where: { bautizo: { equals: true }, sexo: { equals: "H" } }
    )
    encontradosBautizoCountM: encontradosCount(
      where: { bautizo: { equals: true }, sexo: { equals: "M" } }
    )
    bautizoForaneosCount
    bautizoForaneosCountH: bautizoForaneosCount(
      where: { gender: { equals: "H" } }
    )
    bautizoForaneosCountM: bautizoForaneosCount(
      where: { gender: { equals: "M" } }
    )
  }
`;

export interface BautizoCountsResponse {
  encontradosBautizoCount: number;
  encontradosBautizoCountH: number;
  encontradosBautizoCountM: number;
  bautizoForaneosCount: number;
  bautizoForaneosCountH: number;
  bautizoForaneosCountM: number;
}

/** Lista de foráneos bautizados (para modal de registro y tabla). */
export const BAUTIZO_FORANEOS_QUERY = gql`
  query BautizoForaneos {
    bautizoForaneos {
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

export interface BautizoForaneo {
  id: string;
  nombre: string;
  apellido_p: string | null;
  apellido_m: string | null;
  gender: string;
  telefono: string | null;
  notes: string | null;
  create_at: string;
  update_at: string;
}

export interface BautizoForaneosResponse {
  bautizoForaneos: BautizoForaneo[];
}

/** Lista de todos los bautizados (encontrados con bautizo + foráneos) para exportar. */
export const BAUTIZO_LISTA_QUERY = gql`
  query BautizoLista($where: CheckinWhereInput!) {
    checkins(where: $where) {
      encontrado {
        nombre
        apellido_p
        apellido_m
      }
      clave
    }
    bautizoForaneos {
      nombre
      apellido_p
      apellido_m
    }
  }
`;

export interface BautizoListaCheckinItem {
  encontrado: {
    nombre: string;
    apellido_p: string | null;
    apellido_m: string | null;
  };
  clave: string;
}

export interface BautizoListaForaneoItem {
  nombre: string;
  apellido_p: string | null;
  apellido_m: string | null;
}

export interface BautizoListaResponse {
  checkins: BautizoListaCheckinItem[];
  bautizoForaneos: BautizoListaForaneoItem[];
}
