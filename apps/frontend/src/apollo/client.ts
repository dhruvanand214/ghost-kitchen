/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { logout } from "../auth/logout";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql"
});

const authLink = setContext((_, { headers }) => {
  const role = localStorage.getItem("role");

  const token =
    role === "ADMIN"
      ? localStorage.getItem("admin_token")
      : role === "KITCHEN"
      ? localStorage.getItem("kitchen_token")
      : localStorage.getItem("customer_token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});


const errorLink = onError((error) => {
  // ✅ GraphQL errors
  if (
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors) &&
    error.graphQLErrors.length > 0
  ) {
    for (const err of error.graphQLErrors) {
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("jwt expired")
      ) {
        logout();
        return;
      }
    }
  }

  // ✅ Network errors (401 etc.)
  if ("networkError" in error && error.networkError) {
    const statusCode = (error.networkError as any)?.statusCode;
    if (statusCode === 401) {
      logout();
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache()
});
