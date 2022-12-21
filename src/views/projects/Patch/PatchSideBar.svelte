<script lang="ts">
  import type { Patch } from "@app/lib/patch";

  export let patch: Patch;
</script>

<style>
  .metadata {
    flex-basis: 18rem;
    margin-left: 1rem;
    border-radius: var(--border-radius-medium);
    font-size: var(--font-size-small);
    padding-left: 1rem;
  }
  .metadata-section {
    margin-bottom: 1rem;
    border-bottom: 1px dashed var(--color-foreground-4);
  }
  .metadata-section-header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-5);
  }
  .metadata-section-body {
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-6);
  }
  .label {
    border-radius: var(--border-radius);
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-2);
    padding: 0.25rem 0.75rem;
    margin-right: 0.5rem;
    font-size: var(--font-size-small);
    line-height: 1.6;
  }
</style>

<div class="metadata layout-desktop">
  <div class="metadata-section">
    <div class="metadata-section-header">Labels</div>
    <div class="metadata-section-body">
      {#if patch.labels?.length}
        {#each patch.labels as label}
          <span class="label">{label}</span>
        {/each}
      {:else}
        <div class="metadata-section-empty">No labels.</div>
      {/if}
    </div>
  </div>
</div>
