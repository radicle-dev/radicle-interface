<script lang="ts">
  type T = $$Generic;

  export let items: T[];
</script>

<style>
  .list {
    border-top: 1px solid var(--color-fill-separator);
    border-bottom: 1px solid var(--color-fill-separator);
  }
  .list-item:not(:last-child) {
    border-bottom: 1px solid var(--color-fill-separator);
  }
</style>

{#if items.length > 0}
  <div class="list">
    {#each items as item}
      <div class="list-item">
        <slot name="item" {item} />
      </div>
    {/each}
  </div>
{/if}
