<script lang="ts">
  type T = $$Generic;

  export let items: T[];
</script>

<style>
  .list {
    border-radius: var(--border-radius-small);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px var(--color-border-hint);
    background-color: var(--color-background-float);
  }

  .list-item:not(:last-child) {
    border-bottom: 1px solid var(--color-border-hint);
  }

  .header {
    padding: 0.5rem;

    border-bottom: 1px solid var(--color-border-hint);
  }

  @media (max-width: 720px) {
    .list {
      border-radius: 0;
    }
  }
</style>

<div class="list">
  {#if $$slots.header}
    <div class="header">
      <slot name="header" />
    </div>
  {/if}

  {#each items as item}
    <div class="list-item">
      <slot name="item" {item} />
    </div>
  {/each}

  <slot name="body" />
</div>
