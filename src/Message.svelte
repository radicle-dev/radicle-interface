<script lang="ts">
  export let error = false;
</script>

<style>
  .message {
    padding: 1rem;
  }
  .message-error {
    color: var(--color-negative);
    border-radius: var(--border-radius);
    background-color: var(--color-glow-error);
  }
</style>

<div class="message" class:message-error={error}>
  <slot></slot>
</div>
