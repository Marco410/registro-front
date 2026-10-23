import { gql } from "@apollo/client";

/**
 * Crear un usuario del sistema (staff). Si no se manda `username`, el backend lo
 * genera a partir de nombre y apellido; si no se manda rol, asigna `user`.
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
    username?: string;
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
