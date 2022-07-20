import { GraphQLClient } from "graphql-request";

const endpoint = "http://localhost:8080/modules/graphql";

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: { authorization: "Basic " + btoa("root:root1234") },
});