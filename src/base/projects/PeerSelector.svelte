<script lang="ts">
  import Icon from "@app/Icon.svelte";
  import { formatSeedId } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  export let peer: string | null;
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
  .peer:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .item {
    cursor: pointer;
    padding: 0.3rem;
  }
  .item:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .dropdown {
    background-color: var(--color-foreground-background);
    padding: 1rem;
    margin-top: 0.5rem;
    border-radius: 0.25rem;
    display: none;
    position: absolute;
  }
  .peer-dropdown.peer-dropdown-visible {
    display: block;
  }
  .stat {
    display: flex;
    align-items: center;
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    height: 2.125rem;
    background: var(--color-foreground-background);
  }
  @media (max-width: 720px) {
    .dropdown {
      left: 32px;
      z-index: 10;
    }
  }
</style>

<div class="selector">
  <span>
    <div on:click={() => toggleDropdown("peer")} class="stat peer" class:not-allowed={!peers}>
      <Icon name="fork" width={15} height={15} />
      {#if peer}
        {formatSeedId(peer)}
      {/if}
    </div>
    <div
      class="dropdown peer-dropdown"
      class:peer-dropdown-visible={peersDropdown}
    >
      {#each peers as peer}
        <div class="item" on:click={() => switchPeer(peer)}>{peer}</div>
      {/each}
    </div>
  </span>
</div>
