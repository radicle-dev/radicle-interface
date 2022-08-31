import { ethers } from "ethers";
import type { Config } from "./config";
import { decodeRadicleId, formatProjectHash, querySubgraph } from "@app/utils";

const GetAllAnchors = `
  query GetAllAnchors($project: Bytes!, $org: ID!) {
    anchors(orderBy: timestamp, orderDirection: desc, where: { objectId: $project, org: $org }) {
      multihash
      timestamp
    }
  }
`;

interface AnchorObject {
  timestamp: number;
  multihash: string;
}

export async function getProjectAnchors(
  urn: string,
  anchorsStorage: string,
  config: Config,
): Promise<string[]> {
  const unpadded = decodeRadicleId(urn);
  const id = ethers.utils.hexZeroPad(unpadded, 32);
  const allAnchors = await querySubgraph(config.orgs.subgraph, GetAllAnchors, {
    project: id,
    org: anchorsStorage,
  });

  return allAnchors.anchors.map((anchor: AnchorObject) =>
    formatProjectHash(ethers.utils.arrayify(anchor.multihash)),
  );
}
