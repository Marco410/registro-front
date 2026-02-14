import { gql } from "@apollo/client";

/**
 * Mutación para iniciar sesión (authenticateUserWithPassword).
 * Respuesta: sessionToken + item (User) o message (error).
 */
export const LOGIN_MUTATION = gql`
  mutation AuthenticateUserWithPassword(
    $username: String!
    $password: String!
  ) {
    authenticateUserWithPassword(username: $username, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          name
          email
          username
          lastName
          secondLastName
          roles {
            id
            name
          }
          verified
          createdAt
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

/**
 * Mutación para cerrar sesión (endSession).
 */
export const LOGOUT_MUTATION = gql`
  mutation EndSession {
    endSession
  }
`;
