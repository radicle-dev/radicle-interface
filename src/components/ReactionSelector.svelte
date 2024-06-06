<script lang="ts">
  import type { Comment } from "@http-client";

  import { createEventDispatcher } from "svelte";

  import config from "virtual:config";

  import IconButton from "./IconButton.svelte";
  import IconSmall from "./IconSmall.svelte";
  import Popover from "./Popover.svelte";

  export let reactions: Comment["reactions"] | undefined = undefined;

  const dispatch = createEventDispatcher<{
    select: Comment["reactions"][0];
  }>();
</script>

<style>
  .selector {
    display: flex;
    align-items: center;
    border-radius: var(--border-radius-tiny);
    padding: 0.4rem;
    gap: 0.2rem;
  }
  .selector button {
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

<div>
  <Popover
    popoverPositionBottom="2.5rem"
    popoverPositionLeft="0"
    popoverPadding="0">
    <IconButton
      slot="toggle"
      let:toggle
      on:click={toggle}
      title="toggle-reaction-popover">
      <IconSmall name="face" />
    </IconButton>
    <div class="selector" slot="popover">
      {#each config.reactions as reaction}
        {@const lookedUpReaction = reactions?.find(
          ({ emoji }) => emoji === reaction,
        )}
        <button
          class:active={Boolean(lookedUpReaction)}
          on:click={() => {
            dispatch(
              "select",
              lookedUpReaction || { emoji: reaction, authors: [] },
            );
          }}>
          {reaction}
        </button>
      {/each}
    </div>
  </Popover>
</div>
