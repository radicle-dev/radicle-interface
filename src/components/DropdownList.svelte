<script lang="ts">
  type T = $$Generic;

  export let items: T[];
</script>

<style>
  .dropdown {
    align-items: center;
    border-radius: var(--border-radius-small);
    max-height: 60vh;
    overflow-y: auto;
  }
  .dropdown-item {
    padding: 0.25rem 0.25rem 0 0.25rem;
    font-size: var(--font-size-small);
  }
  .dropdown-item:last-child {
    padding-bottom: 0.25rem;
  }
</style>

<div class="dropdown">
  {#each items as item}
    <div class="dropdown-item">
      <slot name="item" {item} />
    </div>
  {/each}
</div>
