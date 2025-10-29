import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const uri = import.meta.env.VITE_GRAPHQL_ENDPOINT || "/graphql";

const httpLink = new HttpLink({ uri, credentials: "include" });

const authLink = setContext((_, { headers }) => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        return {
          headers: {
            ...headers,
            Authorization: `Bearer ${parsed.token}`,
          },
        };
      }
    }
  } catch {}
  return { headers };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});
