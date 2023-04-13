<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import { formatObjectId } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  export let action: "create" | "edit" | "view" = "view";
  export let id: string | undefined = undefined;
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
    margin-bottom: 0.5rem;
    padding-right: 0.5rem;
  }
  .summary-title {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.5rem;
    width: 90%;
  }
  .id {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    color: var(--color-foreground-6);
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .summary-state {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    border-radius: var(--border-radius);
  }
</style>

<header>
  <div class="summary">
    <div class="summary-title txt-medium">
      {#if editable}
        <TextInput transparent variant="form" bind:value={title} />
      {:else}
        {#if title}
          <span class="txt-medium title">{title}</span>
        {:else}
          <span class="txt-missing">No title</span>
        {/if}
        <slot name="revision" />
        {#if id}
          <div class="id">
            <div class="layout-desktop">{id}</div>
            <div class="layout-mobile">
              {formatObjectId(id)}
            </div>
            <Clipboard small text={id} />
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
    <slot name="state" />
  </div>
</header>
