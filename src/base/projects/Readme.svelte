<script lang="ts">
  import Markdown from "@app/Markdown.svelte";
  import type * as proj from "@app/project";

  export let content: string;
  export let getImage: (path: string) => Promise<proj.Blob>;
</script>

<style>
  article {
    padding: 2rem;
    background: var(--color-foreground-background-subtle);
    border-radius: var(--border-radius);
  }
</style>

<article>
  <Markdown {content} {getImage} />
</article>
