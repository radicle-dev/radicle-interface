<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Icon from "@app/Icon.svelte";
  import Dropdown from "@app/Dropdown.svelte";
  import { formatSeedId } from "@app/utils";
  import type { Peer } from "@app/project";
  import Floating from "@app/Floating.svelte";

  export let peer: string | null = null;
  export let peers: Peer[];

  let meta: Peer | undefined;
  // List of items to be created for the Dropdown component.
  let items: { key: string; value: string; badge: string | null }[] = [];

  onMount(() => {
    meta = peers.find(p => p.id === peer);
    items = peers.map(p => {
      if (! p.person?.name) console.debug("Not able to resolve peer identity for: ", p.id);
      let key = p.person?.name ? `<strong>${p.person.name}</strong> ${p.id}` : p.id;

      return { key, value: p.id, badge: p.delegate ? "delegate" : null };
    });
  });

  const dispatch = createEventDispatcher();
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
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    border-radius: var(--border-radius-small);
    user-select: none;
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .selector .badge {
    margin: 0;
  }
  .peer-id {
    margin: 0 0.5rem;
  }
  .peer:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .stat {
    display: flex;
    align-items: center;
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    height: 2.125rem;
    background: var(--color-foreground-background);
  }
</style>

<Floating>
  <div slot="toggle" class="selector">
    <div class="stat peer" class:not-allowed={!peers}>
      <Icon name="fork" width={15} height={15} />
      {#if meta}
        <span class="peer-id">
          {meta.person?.name ?? formatSeedId(meta.id)}
        </span>
        {#if meta.delegate}
          <span class="badge primary">delegate</span>
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
    <Dropdown
      {items}
      selected={peer}
      on:select={(e) => switchPeer(e.detail)}
    />
  </svelte:fragment>
</Floating>
