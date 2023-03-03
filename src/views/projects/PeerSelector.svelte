<script lang="ts" strictEvents>
  import type { Peer } from "@app/lib/project";

  import Badge from "@app/components/Badge.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { formatNodeId, truncateId } from "@app/lib/utils";

  export let peer: string | null = null;
  export let peers: Peer[];

  let meta: Peer | undefined;

  let items: {
    key: string;
    value: string;
    title: string;
    badge: string | null;
  }[] = [];

  function createTitle(p: Peer): string {
    const nodeId = formatNodeId(p.id);
    return p.delegate
      ? `${nodeId} is a delegate of this project`
      : `${nodeId} is a peer tracked by this node`;
  }

  onMount(() => {
    meta = peers.find(p => p.id === peer);
    items = peers.map(p => {
      return {
        key: `<span style="gap: 0;"><span style="color: var(--color-foreground-6);display: inline;">did:key:</span>${p.id}</span>`,
        value: p.id,
        title: createTitle(p),
        badge: p.delegate ? "delegate" : null,
      };
    });
  });

  const dispatch = createEventDispatcher<{ peerChanged: string }>();
  const switchPeer = (peer: string) => {
    dispatch("peerChanged", peer);
  };
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
  }
  .selector .peer {
    padding: 0.5rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    border-radius: var(--border-radius-small);
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer-id {
    margin: 0 0.5rem;
  }
  .peer:hover {
    background-color: var(--color-foreground-2);
  }
  .stat {
    display: flex;
    align-items: center;
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    height: 2rem;
    line-height: initial;
    background: var(--color-foreground-1);
  }
</style>

<Floating>
  <div slot="toggle" class="selector" title="Change peer">
    <div class="stat peer" class:not-allowed={!peers}>
      <Icon name="fork" />
      {#if meta}
        <span class="peer-id">
          <span style="display: flex;">
            <span style="color: var(--color-secondary-5);">did:key:</span>
            {truncateId(meta.id)}
          </span>
        </span>
        {#if meta.delegate}
          <Badge variant="primary">delegate</Badge>
        {/if}
      {:else if peer}
        <span class="peer-id">
          {formatNodeId(peer)}
        </span>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="modal">
    <Dropdown {items} selected={peer} on:select={e => switchPeer(e.detail)} />
  </svelte:fragment>
</Floating>
