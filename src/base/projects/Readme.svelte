<script lang="typescript">
  import Markdown from '@app/Markdown.svelte';
  export let content: string;
</script>

<style>
  article {
    padding: 2rem;
    background: var(--color-foreground-background-subtle);
    border-radius: 0.5rem;
  }
</style>

<article>
  <Markdown {content} />
</article>
