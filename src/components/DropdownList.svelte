<script lang="ts" generics="T">
  export let items: T[];
  export let styleDropdownMinWidth: string | undefined = undefined;
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

<div class="dropdown" style:min-width={styleDropdownMinWidth}>
  {#each items as item}
    <div class="dropdown-item">
      <slot name="item" {item} />
    </div>
  {:else}
    <div class="dropdown-item">
      <slot name="empty" />
    </div>
  {/each}
</div>
