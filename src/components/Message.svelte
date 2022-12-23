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
    background-color: var(--color-negative-3);
  }
</style>

<div class="message" class:message-error={error}>
  <slot />
</div>
