import "./App.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_NODES_QUERY, PUBLISH_NODE_MUTATION } from "./gql";
import { graphQLClient } from "./utils/client";
import { memo, useMemo } from "react";

type Node = {
  uuid: string;
  displayName: string;
  published: {
    value: "true" | "false";
  };
  lastPublished: {
    value: string;
  };
  lastModified: {
    value: string;
  };
};

type ListItemProps = {
  node: Node;
};

function ListItem({ node }: ListItemProps) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation<unknown, unknown, { pathOrId: string }>(
    ["nodes"],
    (variables) => graphQLClient.request(PUBLISH_NODE_MUTATION, variables),
    {
      onSuccess: (data) => {
        console.log("mutate.onSuccess");
        console.log("data", data);
        queryClient.refetchQueries(["nodes"]);
      },
    }
  );

  return (
    <li style={{ padding: "8px 0px" }}>
      <div style={{ display: "flex" }}>
        <span style={{ margin: "8px 16px" }}>
          <div>Display name: {node.displayName}</div>{" "}
          <div>Last published: {node.lastPublished.value}</div>{" "}
          <div>Last modified: {node.lastModified.value}</div>{" "}
        </span>
        <button onClick={() => mutate({ pathOrId: node.uuid })}>publish</button>
      </div>
    </li>
  );
}

function Container() {
  const { isLoading, data, error, refetch } = useQuery(["nodes"], () =>
    graphQLClient.request(GET_NODES_QUERY)
  );

  if (isLoading) {
    return <h4>Loading...</h4>;
  }
  if (error) {
    return <pre style={{ color: "red" }}>{(error as any)?.toString()}</pre>;
  }
  return <List nodes={data.jcr.queryResults.nodes} onRefetch={refetch} />;
}

type ListProps = {
  nodes: Node[];
  onRefetch: () => void;
};

const List = memo(function List({ nodes, onRefetch }: ListProps) {
  const [publishedNodes, unpublishedNodes] = nodes.reduce(
    (acc, node) =>
      node.published.value === "true"
        ? [[...acc[0], node], acc[1]]
        : [acc[0], [...acc[1], node]],

    [[] as Node[], [] as Node[]]
  );

  console.log("unpublishedNodes", unpublishedNodes);
  console.log("publishedNodes", publishedNodes);

  return (
    <>
      <button onClick={() => onRefetch()}>Refetch all</button>
      <h4>Unpublished nodes</h4>
      <ul>
        {unpublishedNodes.map((node: Node) => (
          <ListItem key={node.uuid} node={node} />
        ))}
      </ul>
      <h4>Published nodes</h4>
      <ul>
        {publishedNodes.map((node: Node) => (
          <ListItem key={node.uuid} node={node} />
        ))}
      </ul>
    </>
  );
});

function App() {
  return (
    <div className="App">
      <h1>Jahia challenge</h1>
      <Container />
    </div>
  );
}

export default App;
