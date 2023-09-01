<script lang="ts">
  export let insertions: number;
  export let deletions: number;
</script>

<style>
  .badge {
    display: flex;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-monospace);
    height: var(--button-small-height);
    white-space: nowrap;
    border-radius: var(--border-radius-round);
    box-shadow: inset 0 0 0 1px var(--color-border-hint);
    overflow: hidden;
    background-color: var(--color-background-default);
  }
  .positive {
    display: flex;
    border-right: 1px solid var(--color-border-hint);
    padding: 0 0.75rem;
    align-items: center;
    color: var(--color-foreground-success);
  }
  .negative {
    display: flex;
    border-left: 0;
    padding: 0 0.75rem;
    align-items: center;
    color: var(--color-foreground-red);
  }
</style>

<div class="badge">
  <div class="positive">
    + {insertions}
  </div>
  <div class="negative">
    - {deletions}
  </div>
</div>
