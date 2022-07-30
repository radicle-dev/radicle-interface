<script lang="ts">
  export let icon: string;
</script>

<style>
  .placeholder {
    text-align: center;
    border-radius: var(--border-radius-small);
    padding-bottom: 2rem;
    color: var(--color-foreground-5) !important;
    background-color: var(--color-foreground-1);
  }
  .placeholder header {
    padding: 1rem 0;
    font-weight: var(--font-weight-bold);
  }
  .placeholder .icon {
    margin-bottom: 1rem;
  }
</style>

<div class="error error-message placeholder">
  <header>
    <div class="icon txt-large">{icon}</div>
    <slot name="title" />
  </header>
  <slot name="body" />
</div>
