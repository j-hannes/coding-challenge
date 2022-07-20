import { gql } from "graphql-request";

export const GET_NODES_QUERY = gql`
  query {
    jcr(workspace: EDIT) {
      queryResults: nodesByCriteria(
        criteria: { nodeType: "jnt:content", paths: "/sites/digitall" }
      ) {
        nodes {
          uuid
          displayName
          path
          published: property(name: "j:published") {
            value
          }
          lastModified: property(name: "jcr:lastModified") {
            value
          }
          lastPublished: property(name: "j:lastPublished") {
            value
          }
        }
      }
    }
  }
`;

export const PUBLISH_NODE_MUTATION = gql`
  mutation ($pathOrId: String!, $language: [String] = ["en"]) {
    jcr(workspace: EDIT) {
      mutateNode(pathOrId: $pathOrId) {
        publish(languages: $language)
      }
    }
  }
`;