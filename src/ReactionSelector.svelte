<!-- TODO: Once we are able to add reactions, we should allow people to interact with the reaction handler -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@app/Icon.svelte";
  import config from "@app/config.json";

  const showReactions = false;

  const dispatch = createEventDispatcher();
</script>

<style>
  .selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--color-foreground-5);
    border-radius: var(--border-radius);
    height: 1rem;
    width: 1rem;
    cursor: not-allowed;
  }
  .selector > div {
    display: flex;
  }

  .modal {
    position: absolute;
    left: 1.5rem;
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius);
  }
  .modal > div {
    padding: 0.5rem;
  }
  .modal > div:last-child {
    border-top-right-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }
  .modal > div:first-child {
    border-top-left-radius: var(--border-radius-small);
    border-bottom-left-radius: var(--border-radius-small);
  }
  .modal > div:hover {
    background-color: var(--color-foreground-2);
  }
</style>

<div class="selector">
  <Icon name="ellipsis" />
  {#if showReactions}
    <div class="modal">
      {#each config.reactions as reaction}
        <div on:click={() => dispatch("select", reaction)}>
          {reaction}
        </div>
      {/each}
    </div>
  {/if}
</div>
