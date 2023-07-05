<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import Markdown from "@app/components/Markdown.svelte";

  export let baseUrl: BaseUrl;
  export let content: string;
  export let hash: string | undefined = undefined;
  export let path: string;
  export let projectId: string;
  export let rawPath: string;
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
  <Markdown {baseUrl} {projectId} {content} {hash} {rawPath} {path} />
</article>
