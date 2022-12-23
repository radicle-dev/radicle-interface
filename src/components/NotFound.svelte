<script lang="ts">
  import * as router from "@app/lib/router";
  import { twemoji } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";

  export let title: string;
  export let subtitle: string;
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  .emoji {
    display: flex;
    font-size: var(--font-size-xx-large);
  }

  .title {
    color: var(--color-secondary);
  }

  .actions {
    margin-top: 1rem;
  }
</style>

<div class="container">
  <div class="emoji" use:twemoji>🏜️</div>
  <div class="title txt-medium txt-bold">{title}</div>
  <div>{subtitle}</div>

  <div class="actions">
    <Button variant="foreground" on:click={router.pop}>Back</Button>
  </div>
</div>
