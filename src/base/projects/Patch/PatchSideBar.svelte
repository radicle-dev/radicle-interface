<script lang="ts">
  import type { Patch } from "@app/patch";

  export let patch: Patch;
</script>

<style>
  .metadata {
    flex-basis: 18rem;
    margin-left: 1rem;
    border-radius: var(--border-radius-medium);
    font-size: 0.875rem;
    padding-left: 1rem;
    margin: 1.5rem 0;
  }
  .metadata-section {
    margin-bottom: 1rem;
    border-bottom: 1px dashed var(--color-foreground-subtle);
  }
  .metadata-section-header {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .metadata-section-body {
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-90);
  }
  .label {
    border-radius: var(--border-radius);
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
    padding: 0.25rem 0.75rem;
    margin-right: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
  }
</style>

<div class="metadata desktop">
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
