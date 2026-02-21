import { gql } from "@apollo/client";

/**
 * Query para listar usuarios con sus check-ins y registros (encontrados)
 * para calcular medias de tiempo por registro y por check-in.
 */
export const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      lastName
      username
      phone
      createdAt
      checkinsCount
      encontradosCount
      checkins {
        id
        checkinAt
      }
      encontrados {
        create_at
      }
    }
  }
`;

export interface UserCheckin {
  id: string;
  checkinAt: string;
}

export interface UserEncontrado {
  create_at: string;
}

export interface UserListItem {
  id: string;
  name: string;
  lastName: string;
  username: string;
  phone: string | null;
  createdAt: string;
  checkinsCount: number;
  encontradosCount: number;
  checkins: UserCheckin[];
  encontrados: UserEncontrado[];
}

export interface UsersQueryResponse {
  users: UserListItem[];
}
