<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import config from "@app/config.json";

  import IconButton from "./IconButton.svelte";
  import IconSmall from "./IconSmall.svelte";
  import Popover, { closeFocused } from "./Popover.svelte";

  export let nid: string;
  export let reactions: Map<string, string[]>;

  const dispatch = createEventDispatcher<{
    select: { nids: string[]; reaction: string };
  }>();
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    border-radius: var(--border-radius-tiny);
    padding: 0.2rem;
    gap: 0.2rem;
  }
  .selector button {
    padding: 0.5rem;
    border: 0;
    background-color: transparent;
  }
  .selector button.active {
    border-radius: var(--border-radius-small);
    background-color: var(--color-fill-ghost);
  }
  .selector button:hover {
    cursor: pointer;
    border-radius: var(--border-radius-small);
    background-color: var(--color-fill-ghost);
  }
</style>

<Popover
  popoverPositionBottom="2rem"
  popoverPositionLeft="0"
  popoverPadding="0">
  <IconButton slot="toggle" title="toggle-reaction-popover">
    <IconSmall name="face" />
  </IconButton>

  <div class="selector" slot="popover">
    {#each config.reactions as reaction}
      <button
        class:active={reactions.get(reaction)?.includes(nid)}
        on:click={() => {
          dispatch("select", {
            nids: reactions.get(reaction) ?? [],
            reaction,
          });
          closeFocused();
        }}>
        {reaction}
      </button>
    {/each}
  </div>
</Popover>
