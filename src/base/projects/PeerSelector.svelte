<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@app/Icon.svelte";
  import Dropdown from "@app/Dropdown.svelte";
  import { formatSeedId } from "@app/utils";

  export let peer: string;
  export let peers: string[];
  export let toggleDropdown: (input: string) => void;
  export let peersDropdown = false;

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
    border-radius: 0.25rem;
  }
  .selector .peer.not-allowed {
    cursor: not-allowed;
  }
  .peer-id {
    margin-left: 0.5rem;
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

<div class="selector">
  <span>
    <div on:click={() => toggleDropdown("peer")} class="stat peer" class:not-allowed={!peers}>
      <Icon name="fork" width={15} height={15} />
      {#if peer}
        <span class="peer-id">
          {formatSeedId(peer)}
        </span>
      {/if}
    </div>
    <Dropdown
      items={peers}
      visible={peersDropdown}
      on:select={(e) => switchPeer(e.detail)}
    />
  </span>
</div>
