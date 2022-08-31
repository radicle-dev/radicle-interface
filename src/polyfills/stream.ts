// This shim is used as a stand-in for the node "stream" library, used by
// the "keccack" package depended on by @gnosis.pm/safe-core-sdk.
import * as streams from "@stardazed/streams";

// "Transform" is the old name for "TransformStream".
export const Transform = streams.TransformStream;
export default streams;
