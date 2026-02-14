import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
// @ts-ignore
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { SESSION_TOKEN_KEY } from "registro/lib/auth";

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  const token = window.localStorage?.getItem(SESSION_TOKEN_KEY);
  if (!token) return { headers };
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

export const createApolloClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache(),
    credentials: "include",
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
};

const client = createApolloClient();
export default client;
