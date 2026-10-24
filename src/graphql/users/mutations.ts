import { gql } from "@apollo/client";

/**
 * Crear un usuario del sistema (staff). El front siempre manda `username` y un
 * `email` derivado (`usuario@email.com`), porque `email` es único en el backend
 * y dos usuarios sin correo chocan. Si no se manda rol, el backend asigna `user`.
 */
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      lastName
      username
    }
  }
`;

export interface CreateUserVariables {
  data: {
    name: string;
    lastName?: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    roles: { connect: { name: string }[] };
  };
}

export interface CreateUserResponse {
  createUser: {
    id: string;
    name: string;
    lastName: string | null;
    username: string;
  } | null;
}

/**
 * Cierra todas las sesiones de un usuario (solo admin; el backend no deja hacerlo sobre
 * el propio usuario). Sus tokens dejan de valer y tiene que volver a iniciar sesión en
 * cada equipo; el front lo saca al login en menos de un minuto.
 */
export const REVOKE_USER_SESSIONS_MUTATION = gql`
  mutation RevokeUserSessions($userId: ID!) {
    revokeUserSessions(userId: $userId) {
      userId
      revokedAt
    }
  }
`;

export interface RevokeUserSessionsVariables {
  userId: string;
}

export interface RevokeUserSessionsResponse {
  revokeUserSessions: {
    userId: string;
    revokedAt: string;
  } | null;
}
