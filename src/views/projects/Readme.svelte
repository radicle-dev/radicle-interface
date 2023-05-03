<script lang="ts">
  import type { ProjectRoute } from "@app/views/projects/router";

  import Markdown from "@app/components/Markdown.svelte";

  export let content: string;
  export let rawPath: string;
  export let activeRoute: ProjectRoute;

  $: path = activeRoute.params.path || "/";
  $: hash = activeRoute.params.hash || null;
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
