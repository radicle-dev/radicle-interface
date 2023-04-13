<script lang="ts" strictEvents>
  import type { Item } from "@app/components/Dropdown.svelte";
  import type { Remote } from "@httpd-client";

  import { createEventDispatcher, onMount } from "svelte";

  import { formatNodeId, truncateId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Dropdown from "@app/components/Dropdown.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let peer: string | null = null;
  export let peers: Remote[];

  let meta: Remote | undefined;

  let items: Item<string>[] = [];

  function createTitle(p: Remote): string {
    const nodeId = formatNodeId(p.id);
    return p.delegate
      ? `${nodeId} is a delegate of this project`
      : `${nodeId} is a peer tracked by this node`;
  }

  onMount(() => {
    meta = peers.find(p => p.id === peer);
    items = peers.map(p => {
      return {
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
  .selected {
    padding: 0.5rem 0.75rem !important;
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer:hover {
    background-color: var(--color-foreground-2);
  }
  .peer-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;
  }
  .prefix {
    display: inline-block;
    color: var(--color-secondary-6);
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
    <div class="stat peer" class:selected={peer} class:not-allowed={!peers}>
      {#if !peer}
        <Icon name="fork" />
      {/if}
      {#if meta}
        <span style:display="flex">
          <Avatar nodeId={meta.id} inline />
          <span style:color="var(--color-secondary-5)">did:key:</span>
          {truncateId(meta.id)}
        </span>
        {#if meta.delegate}
          <Badge variant="primary">delegate</Badge>
        {/if}
      {:else if peer}
        <span style:display="flex">
          <Avatar nodeId={peer} inline />
          <span style:color="var(--color-secondary-5)">did:key:</span>
          {truncateId(peer)}
        </span>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="modal">
    <Dropdown
      {items}
      selected={peer}
      on:select={e => switchPeer(e.detail.value)}>
      <div class="peer-item" slot="item" let:item>
        <Avatar nodeId={item.value} inline />
        <!-- We ignore prettier here for the following line
             to avoid getting a whitespace between did:key: and the nid due to a newline -->
        <!-- prettier-ignore -->
        <span><span class="prefix">did:key:</span>{item.value}</span>
        {#if item.badge}
          <Badge variant="primary">{item.badge}</Badge>
        {/if}
      </div>
    </Dropdown>
  </svelte:fragment>
</Floating>
