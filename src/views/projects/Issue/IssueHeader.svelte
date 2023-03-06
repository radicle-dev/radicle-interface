<script lang="ts" strictEvents>
  import type { Author } from "@app/lib/cobs";
  import type { State } from "@app/lib/issue";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { createEventDispatcher } from "svelte";
  import { formatObjectId } from "@app/lib/cobs";

  export let action: "create" | "edit" | "view" = "view";
  export let author: Author;
  export let id: string | undefined = undefined;
  export let state: State;
  export let timestamp: number;
  export let title: string = "";

  const dispatch = createEventDispatcher<{ editTitle: string }>();

  $: editable = action === "create" ? true : false;
</script>

<style>
  header {
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
    margin-bottom: 1rem;
    padding: 1rem;
  }
  .summary {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .summary-title {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 1rem;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .id {
    font-size: var(--font-size-tiny);
    color: var(--color-foreground-5);
  }
  .summary-state {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    border-radius: var(--border-radius);
  }

  @media (max-width: 960px) {
    .summary-state {
      margin-left: 0.5rem;
    }
  }
</style>

<header>
  <div class="summary">
    <div class="summary-title txt-medium">
      {#if editable}
        <TextInput transparent variant="form" bind:value={title} />
      {:else}
        {#if title}
          <span class="txt-medium">{title}</span>
        {:else}
          <span class="txt-missing">No title</span>
        {/if}
        {#if id}
          <div class="txt-monospace id layout-desktop">{id}</div>
          <div class="txt-monospace id layout-mobile">
            {formatObjectId(id)}
          </div>
        {/if}
      {/if}
    </div>
    {#if action === "edit"}
      <Button
        variant="text"
        size="small"
        on:click={() => {
          editable = !editable;
          dispatch("editTitle", title);
        }}>
        {#if editable}
          save
        {:else}
          edit
        {/if}
      </Button>
    {/if}
  </div>
  <div class="summary-state">
    {#if state.status === "open"}
      <Badge variant="positive">
        {state.status}
      </Badge>
    {:else}
      <Badge variant="negative">
        {state.status} as
        {state.reason}
      </Badge>
    {/if}
    <Authorship {timestamp} {author} caption="opened this issue" />
  </div>
</header>
