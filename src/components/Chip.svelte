<script lang="ts">
  export let actionable: boolean = false;
</script>

<style>
  .chip {
    user-select: none;
    display: inline-flex;
    justify-content: center;
    align-items: stretch;
    color: inherit;
  }
  .section {
    display: flex;
    width: 100%;
    align-items: center;
    max-width: 13.5rem;
    padding: 0.2rem 0.5rem;
  }
  .text {
    background-color: var(--color-secondary-3);
    border-radius: var(--border-radius);
  }
  .icon {
    color: var(--color-secondary);
    border: none;
    border-bottom-right-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    background-color: var(--color-secondary-2);
    line-height: 1.5;
    cursor: pointer;
  }
  .icon:hover {
    background-color: var(--color-secondary-5);
    color: var(--color-foreground);
  }
  .actionable {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
</style>

<div class="chip">
  <span class="section text" class:actionable>
    <slot name="content" />
  </span>
  {#if actionable}
    <span class="section icon">
      <slot name="icon" />
    </span>
  {/if}
</div>
