<script lang="ts" strictEvents>
  import { createEventDispatcher, onMount } from "svelte";
  import Icon from "@app/Icon.svelte";
  import Dropdown from "@app/Dropdown.svelte";
  import { formatSeedId } from "@app/utils";
  import type { Peer } from "@app/project";
  import Floating from "@app/Floating.svelte";
  import Badge from "@app/Badge.svelte";

  export let peer: string | null = null;
  export let peers: Peer[];

  let meta: Peer | undefined;
  // List of items to be created for the Dropdown component.
  let items: {
    key: string;
    value: string;
    title: string;
    badge: string | null;
  }[] = [];

  function createTitle(p: Peer): string {
    const name = p.person?.name ? p.person.name : p.id;
    return p.delegate
      ? `${name} is a delegate of this project`
      : `${name} is a peer tracked by this seed`;
  }

  onMount(() => {
    meta = peers.find(p => p.id === peer);
    items = peers.map(p => {
      if (!p.person?.name) {
        console.debug("Not able to resolve peer identity for: ", p.id);
      }
      const key = p.person?.name
        ? `<span class="txt-bold">${p.person.name}</span> ${p.id}`
        : p.id;

      return {
        key,
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
          {meta.person?.name ?? formatSeedId(meta.id)}
        </span>
        {#if meta.delegate}
          <Badge variant="primary">delegate</Badge>
        {/if}
        <!-- If the delegate metadata is not found -->
      {:else if peer}
        <span class="peer-id">
          {formatSeedId(peer)}
        </span>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="modal">
    <Dropdown {items} selected={peer} on:select={e => switchPeer(e.detail)} />
  </svelte:fragment>
</Floating>
