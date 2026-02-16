import { gql } from "@apollo/client";

/**
 * Query para obtener el usuario autenticado (sesión actual).
 */
export const AUTHENTICATED_ITEM_QUERY = gql`
  query AuthenticatedItem {
    authenticatedItem {
      ... on User {
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
        createdAt
      }
    }
  }
`;
