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
    padding: 0.5rem 0;
    position: absolute;
    box-shadow: var(--elevation-low);
    z-index: 10;
    border-radius: var(--border-radius-small);
    overflow-y: auto;
    max-height: 60vh;
  }
</style>

<div class="dropdown">
  {#each items as item}
    <slot name="item" {item} />
  {/each}
</div>
