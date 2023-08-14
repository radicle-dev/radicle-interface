<script lang="ts" strictEvents>
</script>

<style>
  .reaction {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--color-secondary);
  }
  .section:hover {
    cursor: pointer;
    background-color: var(--color-secondary-4);
    color: var(--color-foreground);
  }
  .section {
    display: flex;
    align-items: center;
    max-width: 13.5rem;
    padding: 0.2rem 0.5rem;
  }
  .text {
    background-color: var(--color-secondary-3);
    border-radius: var(--border-radius);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="reaction" on:click>
  <span class="section text">
    <slot />
  </span>
</div>
