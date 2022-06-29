<script lang="ts">
  export let icon: string;
</script>

<style>
  .placeholder {
    text-align: center;
    border-radius: var(--border-radius-small);
    padding-bottom: 2rem;
    color: var(--color-foreground-faded) !important;
    background-color: var(--color-foreground-background);
  }
  .placeholder header {
    padding: 1rem 0;
    font-weight: bold;
  }
  .placeholder .icon {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
</style>

<div class="error error-message placeholder">
  <header>
    <div class="icon">{icon}</div>
    <slot name="title"></slot>
  </header>
  <slot name="body"></slot>
</div>
