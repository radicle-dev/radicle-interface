<script lang="ts">
  import { twemoji } from "@app/lib/utils";

  export let title: string;
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
</style>

<div class="layout-centered">
  <div class="container">
    <div class="emoji" use:twemoji>🏜️</div>
    <div class="title txt-medium txt-bold">{title}</div>
  </div>
</div>
