import { ethers } from "ethers";
import type { Config } from "./config";
import { decodeRadicleId, formatProjectHash, querySubgraph } from "./utils";

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

export async function getAllAnchors(config: Config, urn: string, anchors?: string | null): Promise<string[]> {
  if (! anchors) {
    return [];
  }
  const unpadded = decodeRadicleId(urn);
  const id = ethers.utils.hexZeroPad(unpadded, 32);
  const allAnchors = await querySubgraph(config.orgs.subgraph, GetAllAnchors, { project: id, org: anchors });
  return allAnchors.anchors
    .map((anchor: AnchorObject) => formatProjectHash(ethers.utils.arrayify(anchor.multihash)));
}
