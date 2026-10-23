import { gql } from "@apollo/client";

/**
 * Crea equipos con sus asientos, como `db:seed` (resolver custom, solo admin).
 * Backend: generateTeams(input: GenerateTeamsInput!): GenerateTeamsResult
 */
export const GENERATE_TEAMS_MUTATION = gql`
  mutation GenerateTeams($input: GenerateTeamsInput!) {
    generateTeams(input: $input) {
      teamsCreated
      seatsCreated
    }
  }
`;

export interface GenerateTeamsVariables {
  input: {
    groups: { ageGroupId: string; count: number }[];
    seatsHombres: number;
    seatsMujeres: number;
  };
}

export interface GenerateTeamsResponse {
  generateTeams: { teamsCreated: number; seatsCreated: number } | null;
}

/**
 * Borra en lote lo elegido (resolver custom, solo admin). Borrar encontrados o equipos
 * borra también los check-ins.
 * Backend: cleanDatabase(input: CleanDatabaseInput!): CleanDatabaseResult
 */
export const CLEAN_DATABASE_MUTATION = gql`
  mutation CleanDatabase($input: CleanDatabaseInput!) {
    cleanDatabase(input: $input) {
      checkins
      checkinRequests
      seatsFreed
      encontrados
      teams
      seats
      bautizosForaneos
      bautizosQuitados
      auditLogs
    }
  }
`;

export interface CleanDatabaseOptions {
  checkins: boolean;
  encontrados: boolean;
  teams: boolean;
  bautizos: boolean;
  auditLogs: boolean;
}

export interface CleanDatabaseVariables {
  input: CleanDatabaseOptions;
}

export interface CleanDatabaseResult {
  checkins: number;
  checkinRequests: number;
  seatsFreed: number;
  encontrados: number;
  teams: number;
  seats: number;
  bautizosForaneos: number;
  bautizosQuitados: number;
  auditLogs: number;
}

export interface CleanDatabaseResponse {
  cleanDatabase: CleanDatabaseResult | null;
}

/**
 * Crea los roles y grupos de edad del seed que falten (resolver custom, solo admin).
 * Backend: seedAgeGroups: SeedAgeGroupsResult
 */
export const SEED_AGE_GROUPS_MUTATION = gql`
  mutation SeedAgeGroups {
    seedAgeGroups {
      ageGroupsCreated
      rolesCreated
    }
  }
`;

export interface SeedAgeGroupsResponse {
  seedAgeGroups: { ageGroupsCreated: number; rolesCreated: number } | null;
}
