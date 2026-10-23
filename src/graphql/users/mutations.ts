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
