<script lang="ts">
  import type * as proj from "@app/project";
  import type { ProjectRoute } from "@app/router/definitions";

  import Markdown from "@app/Markdown.svelte";
  import { activeRouteStore } from "@app/router";

  export let content: string;
  export let getImage: (path: string) => Promise<proj.Blob>;

  $: route = $activeRouteStore as ProjectRoute;
  $: hash = route.params.hash || null;
</script>

<style>
  article {
    padding: 2rem;
    max-width: 64rem;
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
  }
</style>

<article>
  <Markdown {content} {getImage} {hash} />
</article>
