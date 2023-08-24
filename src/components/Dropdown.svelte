<script lang="ts">
  type T = $$Generic;

  export let items: T[];
</script>

<style>
  .dropdown {
    align-items: center;
    background: var(--color-background-float);
    border: 1px solid var(--color-border-hint);
    margin-top: 0.5rem;
    position: absolute;
    box-shadow: var(--elevation-low);
    z-index: 10;
    border-radius: var(--border-radius-small);
    overflow-y: auto;
    max-height: 60vh;
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
