<script lang="ts">
  import { twemoji } from "@app/lib/utils";

  export let emoji: string = "👻";
  export let title: string;
  export let message: string;
</script>

<style>
  .error {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  .emoji {
    font-size: var(--font-size-xx-large);
    display: flex;
  }

  .title {
    color: var(--color-negative);
  }

  .message {
    color: var(--color-foreground-6);
  }
</style>

<div class="error">
  <div class="emoji" use:twemoji>{emoji}</div>
  <div class="title txt-medium txt-bold">{title}</div>
  <div class="message">{message}</div>
</div>
