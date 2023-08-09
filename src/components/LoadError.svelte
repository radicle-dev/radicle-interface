<script lang="ts">
  import { twemoji } from "@app/lib/utils";

  import ErrorMessage from "@app/components/ErrorMessage.svelte";

  export let title: string;
  export let errorMessage: string;
  export let stackTrace: string;
</script>

<style>
  .wrapper {
    gap: 1rem;
  }

  .emoji {
    display: flex;
    font-size: var(--font-size-xx-large);
  }
</style>

<div class="wrapper layout-centered">
  <div class="emoji" use:twemoji>🏜️</div>
  <div class="title txt-medium txt-bold txt-highlight">
    {title}
  </div>

  <ErrorMessage message={errorMessage} {stackTrace} />
</div>
