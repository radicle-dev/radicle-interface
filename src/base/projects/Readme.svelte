<script lang="ts">
  import Markdown from "@app/Components/Markdown.svelte";
  export let content: string;
</script>

<article>
  <Markdown {content} />
</article>

<style>
  article {
    padding: 2rem;
    background: var(--color-foreground-background-subtle);
    border-radius: 0.5rem;
  }
</style>
