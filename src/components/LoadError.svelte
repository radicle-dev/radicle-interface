<script lang="ts">
  import { twemoji } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";

  export let title: string | undefined = undefined;
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
  {#if title}
    <div class="title txt-medium txt-bold txt-highlight">
      {title}
    </div>
  {/if}
  <ErrorMessage message={errorMessage} {stackTrace} />
  <div style:margin-top="1rem">
    <Button variant="foreground" on:click={() => window.history.back()}>
      Back
    </Button>
  </div>
</div>
