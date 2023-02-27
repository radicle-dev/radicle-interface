<script lang="ts">
  export let insertions: number;
  export let deletions: number;
</script>

<style>
  .badge {
    font-size: var(--font-size-tiny);
    line-height: 1.6;
    height: var(--button-tiny-height);
    display: flex;
    flex-direction: row;
    white-space: nowrap;
  }
  .positive {
    padding: 0.125rem 0.5rem;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    color: var(--color-positive-6);
    background-color: var(--color-positive-3);
  }
  .negative {
    padding: 0.125rem 0.5rem;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    color: var(--color-negative);
    background-color: var(--color-negative-4);
  }
</style>

<div class="badge">
  <span class="positive">
    + {insertions}
  </span>
  <span class="negative">
    - {deletions}
  </span>
</div>
