<script lang="ts">
  export let style: string | undefined = undefined;
</script>

<style>
  .modal {
    position: absolute;
    background: var(--color-background-float);
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-regular);
    box-shadow: var(--elevation-low);
    padding: 1rem;
    z-index: 10;
  }
</style>

<div class="modal" {style}>
  <slot />
</div>
