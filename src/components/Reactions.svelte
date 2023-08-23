<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Chip from "@app/components/Chip.svelte";
  import Floating, { closeFocused } from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import config from "@app/config.json";
  import { httpdStore } from "@app/lib/httpd";

  export let id: string;
  export let reactions: [string, string][];

  const dispatch = createEventDispatcher<{
    react: { nids: string[]; id: string; reaction: string };
  }>();

  $: groupedReactions = reactions?.reduce(
    (acc, [nid, emoji]) => acc.set(emoji, [...(acc.get(emoji) ?? []), nid]),
    new Map<string, string[]>(),
  );
</script>

<style>
  section {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .reaction {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5rem;
    font-size: var(--font-size-tiny);
  }
  .toggle {
    /* Height of one reaction */
    height: 1.525rem;
  }
  .toggle:hover {
    color: var(--color-foreground-5);
  }
  .reaction-selector {
    position: absolute;
    bottom: 2.2rem;
    display: flex;
    align-items: center;
    background-color: var(--color-background-1);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-foreground-3);
    box-shadow: var(--elevation-low);
    padding: 0.2rem;
    gap: 0.2rem;
  }
  .reaction-selector button {
    padding: 0.5rem;
    border: 0;
    background-color: transparent;
  }
  .reaction-selector button.active {
    border-radius: var(--border-radius-small);
    background-color: var(--color-background);
  }
  .reaction-selector button:hover {
    cursor: pointer;
    border-radius: var(--border-radius-small);
    background-color: var(--color-background);
  }
</style>

<section>
  {#if $httpdStore.state === "authenticated"}
    <Floating>
      <div class="reaction-selector" slot="modal">
        {#each config.reactions as reaction}
          <button
            class:active={groupedReactions
              .get(reaction)
              ?.includes($httpdStore.session.publicKey)}
            on:click={() => {
              dispatch("react", {
                nids: groupedReactions.get(reaction) ?? [],
                id,
                reaction,
              });
              closeFocused();
            }}>
            {reaction}
          </button>
        {/each}
      </div>
      <div slot="toggle" class="toggle">
        <Icon name="face" />
      </div>
    </Floating>
  {/if}
  {#if groupedReactions.size > 0}
    {#each groupedReactions as [reaction, nids], key}
      <Chip
        {key}
        clickable={$httpdStore.state === "authenticated"}
        on:click={() => {
          if ($httpdStore.state === "authenticated") {
            dispatch("react", { nids, id, reaction });
          }
        }}>
        <div class="reaction">
          <span>{reaction}</span>
          <span title={nids.join("\n")}>{nids.length}</span>
        </div>
      </Chip>
    {/each}
  {/if}
</section>
