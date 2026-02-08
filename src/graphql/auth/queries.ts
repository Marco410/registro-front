import { gql } from "@apollo/client";

export const AUTHENTICATED_ITEM_QUERY = gql`
  query AuthenticatedItem {
    authenticatedItem {
      ... on User {
        id
        email
        name
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

export const LOGIN_MUTATION = gql`
  mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          email
          name
          lastName
          secondLastName
          roles {
            id
            name
          }
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation EndSession {
    endSession
  }
`;
