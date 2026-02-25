import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloLink } from "@apollo/client";
// @ts-ignore
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { SESSION_TOKEN_KEY } from "registro/lib/auth";

const TUNNEL_HOSTNAME = "registroayr.kadesh.mx";

/**
 * Devuelve la URL del API según el origen.
 * En Next.js solo NEXT_PUBLIC_* está disponible en el navegador, por eso
 * la URL del backend por túnel debe ser NEXT_PUBLIC_TUNNEL_API_URL.
 * - Si el host es el del túnel (registroayr.kadesh.mx) → NEXT_PUBLIC_TUNNEL_API_URL
 * - Si es localhost o IP (desarrollo local) → NEXT_PUBLIC_API_URL
 */
function getGraphQLUri(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === TUNNEL_HOSTNAME) {
      return (
        process.env.NEXT_PUBLIC_TUNNEL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
      );
    }
    return process.env.NEXT_PUBLIC_API_URL || "";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_TUNNEL_API_URL ||
    ""
  );
}

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
  uri: getGraphQLUri(),
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
