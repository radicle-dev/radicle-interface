<script lang="ts">
  import Markdown from "@app/components/Markdown.svelte";

  export let content: string;
  export let rawPath: string;
  export let path: string;
  export let hash: string | undefined = undefined;
</script>

<style>
  article {
    padding: 2rem;
    width: 100%;
    background: var(--color-background-1);
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }
</style>

<article>
  <Markdown {content} {hash} {rawPath} {path} />
</article>
