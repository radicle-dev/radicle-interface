// This shim is used as a stand-in for the node "events" library, used by
// the "keccack" package depended on by @gnosis.pm/safe-core-sdk.
import events from 'events';

export default events;
