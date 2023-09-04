<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import Chip from "@app/components/Chip.svelte";
  import { httpdStore } from "@app/lib/httpd";

  export let reactions: Map<string, string[]>;

  const dispatch = createEventDispatcher<{
    remove: { nids: string[]; reaction: string };
  }>();
</script>

<style>
  .reactions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .reaction {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .close {
    color: inherit;
    border: none;
    border-bottom-right-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    background-color: transparent;
    line-height: 1.5;
    padding: 0;
    cursor: pointer;
  }
  .close:hover {
    color: var(--color-foreground);
  }
</style>

<div class="reactions">
  {#each reactions as [reaction, nids]}
    <Chip actionable={Boolean($httpdStore.state === "authenticated")}>
      <div slot="content" class="reaction txt-tiny">
        <span>{reaction}</span>
        <span title={nids.join("\n")}>{nids.length}</span>
      </div>
      <div slot="icon">
        <button
          class="close"
          on:click={() => dispatch("remove", { nids, reaction })}>
          ✕
        </button>
      </div>
    </Chip>
  {/each}
</div>
