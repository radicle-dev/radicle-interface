<script lang="ts">
  import type * as proj from "@app/project";
  import type { ProjectRoute } from "@app/router/definitions";

  import Markdown from "@app/Markdown.svelte";

  export let content: string;
  export let getImage: (path: string) => Promise<proj.MaybeBlob>;
  export let activeRoute: ProjectRoute;

  $: hash = activeRoute.params.hash || null;
</script>

<style>
  article {
    padding: 2rem;
    width: 100%;
    background: var(--color-foreground-1);
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }
</style>

<article>
  <Markdown {content} {getImage} {hash} />
</article>
