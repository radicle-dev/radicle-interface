<script lang="ts">
  import * as utils from "@app/lib/utils";

  export let id: string | undefined = undefined;
</script>

<style>
  .header {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-hint);
    padding: 1.5rem;
    border-radius: var(--border-radius-small);
  }
  .subtitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
  }
  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .description {
    font-size: var(--font-size-small);
    margin-top: 1rem;
    word-break: break-word;
  }
</style>

<div class="header">
  <div class="summary">
    <slot name="title" />
  </div>
  <div class="subtitle">
    <slot name="state" />
    {#if id}
      <div class="global-hash">
        {utils.formatObjectId(id)}
      </div>
    {/if}
    <slot name="author" />
  </div>
  <div class="description">
    <slot name="description" />
  </div>
</div>
