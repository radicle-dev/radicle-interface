<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import Markdown from "@app/components/Markdown.svelte";
  import { routeToPath } from "@app/lib/router";

  export let projectId: string;
  export let peer: string | undefined;
  export let baseUrl: BaseUrl;
  export let revision: string | undefined;
  export let content: string;
  export let hash: string | undefined = undefined;
  export let path: string;
  export let rawPath: string;

  let linkBaseUrl: string | undefined;

  $: {
    if (!path || path === "/") {
      // For the default root path, the `tree/<revision>` portion is omitted
      // from the URL. This means that links cannot be resolved with respect
      // to the current location. To work around this we provide path that
      // results a fully expanded URL with which we can resolve all links in the
      // Markdown.
      linkBaseUrl = new URL(
        routeToPath({
          resource: "projects",
          params: {
            id: projectId,
            baseUrl,
            view: { resource: "tree" },
            peer,
            revision,
            path: "README.md",
          },
        }),
        window.origin,
      ).href;
    } else {
      linkBaseUrl = undefined;
    }
  }
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
  <Markdown {linkBaseUrl} {content} {hash} {rawPath} {path} />
</article>
