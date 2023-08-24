<script lang="ts">
  export let insertions: number;
  export let deletions: number;
</script>

<style>
  .badge {
    display: flex;
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-monospace);
    height: var(--button-tiny-height);
    white-space: nowrap;
    border-radius: var(--border-radius-round);
    overflow: hidden;
  }
  .positive {
    display: flex;
    padding: 0 6px;
    align-items: center;
    color: var(--color-foreground-success);
    background-color: var(--color-fill-diff-green-light);
  }
  .negative {
    display: flex;
    padding: 0 6px;
    align-items: center;
    color: var(--color-foreground-red);
    background-color: var(--color-fill-diff-red-light);
  }
</style>

<div class="badge">
  <div class="positive">
    +{insertions}
  </div>
  <div class="negative">
    -{deletions}
  </div>
</div>
