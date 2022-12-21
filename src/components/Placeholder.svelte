<script lang="ts">
  import { twemoji } from "@app/lib/utils";

  export let emoji: string;
</script>

<style>
  .placeholder {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
    color: var(--color-foreground-5);
    overflow-x: hidden;
    padding: 1rem 1rem 2rem 1rem;
    text-align: center;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }
  .placeholder header {
    padding: 1rem 0;
    font-weight: var(--font-weight-bold);
  }
  .placeholder .emoji {
    margin-bottom: 1rem;
  }
</style>

<div class="placeholder">
  <header>
    <div class="emoji txt-large" use:twemoji>{emoji}</div>
    <slot name="title" />
  </header>
  <slot name="body" />
</div>
