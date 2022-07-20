import "./App.css";
import { useMutation, useQuery } from "react-query";
import { gql, GraphQLClient } from "graphql-request";

const endpoint = "http://localhost:8080/modules/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: { authorization: "Basic " + btoa("root:root1234") },
});

const GET_NODES_QUERY = gql`
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

const PUBLISH_NODE_MUTATION = gql`
  mutation ($pathOrId: String!, $language: [String] = ["en"]) {
    jcr(workspace: EDIT) {
      mutateNode(pathOrId: $pathOrId) {
        publish(languages: $language)
      }
    }
  }
`;

function App() {
  const { isLoading, data, error, refetch } = useQuery(["nodes"], () =>
    graphQLClient.request(GET_NODES_QUERY)
  );

  const { mutate } = useMutation<unknown, unknown, { pathOrId: string }>(
    ["nodes"],
    (variables) => graphQLClient.request(PUBLISH_NODE_MUTATION, variables),
    {
      onSuccess: (data) => {
        console.log("mutate.onSuccess");
        console.log("data", data);
        refetch();
      },
    }
  );

  return (
    <div className="App">
      <h1>Jahia challenge</h1>
      {isLoading ? (
        <h4>Loading...</h4>
      ) : error ? (
        <pre style={{ color: "red" }}>{(error as any)?.toString()}</pre>
      ) : (
        <>
          <h4>Unpublished nodes</h4>
          <ul>
            {data?.jcr.queryResults.nodes
              .filter((node: any) => node.published.value !== "true")
              .map((node: any) => (
                <li key={node.uuid}>
                  <span>{node.displayName}</span>
                </li>
              ))}
          </ul>
          <h4>Published nodes</h4>
          <ul>
            {data?.jcr.queryResults.nodes
              .filter((node: any) => node.published.value === "true")
              .map((node: any) => (
                <li key={node.uuid} style={{ padding: "8px 0px" }}>
                  <div style={{ display: "flex" }}>
                    <span style={{ margin: "8px 16px" }}>
                      <div>Display name: {node.displayName}</div>{" "}
                      <div>Last published: {node.lastPublished.value}</div>{" "}
                      <div>Last modified: {node.lastModified.value}</div>{" "}
                    </span>
                    <button
                      onClick={() => {
                        mutate({ pathOrId: node.uuid });
                      }}
                    >
                      publish
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
