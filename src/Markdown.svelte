<script lang="ts">
  import { onMount } from "svelte";
  import { marked } from "marked";
  import matter from "@radicle/gray-matter";
  import type * as proj from "@app/project";
  import {
    markdownExtensions as extensions,
    getImageMime,
    isUrl,
  } from "@app/utils";
  import dompurify from "dompurify";

  export let content: string;
  export let getImage: (path: string) => Promise<proj.Blob>;
  export let doc = matter(content);

  const frontMatter = Object.entries(doc.data);
  marked.use({ extensions });

  let container: HTMLElement;

  const render = (content: string): string =>
    dompurify.sanitize(marked.parse(content));

  onMount(() => {
    // Don't underline <a> tags that contain images.
    const elems = container.querySelectorAll("a");

    for (const e of elems) {
      if (e.firstElementChild instanceof HTMLImageElement) {
        e.classList.add("no-underline");
      }
    }

    // Iterate over all images, and fetch their data from the API, then
    // replace the source with a Data-URL. We do this due to the absence
    // of a static file server.
    for (const i of container.querySelectorAll("img")) {
      const path = i.getAttribute("src");

      // Make sure the source isn't a URL before trying to fetch it from the repo
      if (path && !isUrl(path)) {
        getImage(path).then(blob => {
          if (blob.content) {
            const mime = getImageMime(path);
            if (mime) {
              i.setAttribute("src", `data:${mime};base64,${blob.content}`);
            }
          }
        });
      }
    }
  });
</script>

<style>
  .front-matter {
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    color: var(--color-foreground);
    border: 1px dashed var(--color-foreground-4);
    padding: 0.5rem;
    margin-bottom: 2rem;
  }
  .front-matter table {
    border-collapse: collapse;
  }
  .front-matter table td {
    padding: 0.125rem 1rem;
  }
  .front-matter table td:first-child {
    padding-left: 0.5rem;
  }

  .markdown :global(h1),
  .markdown :global(h2),
  .markdown :global(h3),
  .markdown :global(h4),
  .markdown :global(h5),
  .markdown :global(h6) {
    color: var(--color-foreground);
  }

  .markdown :global(h1) {
    font-size: calc(var(--font-size-huge) * 0.75);
    font-weight: var(--font-weight-medium);
    padding: 1rem 0 0.5rem 0;
    margin: 0 0 0.75rem;
    border-bottom: 1px solid var(--color-foreground-4);
  }

  .markdown :global(h2) {
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-normal);
    padding: 0.25rem 0;
    margin: 2rem 0 0.5rem;
    border-bottom: 1px dashed var(--color-foreground-4);
  }

  .markdown :global(h3) {
    font-size: calc(var(--font-size-medium) * 0.9);
    font-weight: var(--font-weight-medium);
    padding: 0.5rem 0;
    margin: 1rem 0 0.25rem;
  }

  .markdown :global(h4) {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-regular);
    padding: 0.5rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h5),
  .markdown :global(h6) {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-small);
    padding: 0.35rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h6) {
    color: var(--color-foreground-6);
  }

  .markdown :global(p) {
    line-height: 1.625;
    margin-top: 0;
    margin-bottom: 0.625rem;
  }

  .markdown :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown :global(blockquote) {
    border-left: 0.3rem solid var(--color-foreground-4);
    padding: 0 0 0 1rem;
    margin: 0 0 0.625rem 0;
  }

  .markdown :global(strong) {
    font-weight: var(--font-weight-medium);
  }

  .markdown :global(img) {
    border-style: none;
    max-width: 100%;
  }

  .markdown :global(code) {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-regular);
    color: var(--color-secondary-6);
    background-color: var(--color-foreground-2);
    border-radius: 0.5rem;
    padding: 0.125rem 0.25rem;
  }

  .markdown :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown :global(pre) {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-regular);
    background-color: var(--color-foreground-2);
    padding: 1rem !important;
    border-radius: var(--border-radius-small);
    margin: 1rem 0;
    overflow: scroll;
    scrollbar-width: none;
  }

  .markdown :global(pre::-webkit-scrollbar) {
    display: none;
  }

  .markdown :global(a),
  .markdown :global(a > code) {
    background: none;
    padding: 0;
    color: var(--color-foreground);
  }
  .markdown :global(a) {
    text-decoration: none;
    border-bottom: 1px solid var(--color-foreground-6);
  }
  .markdown :global(a.no-underline) {
    border-bottom: none;
  }

  .markdown :global(hr) {
    height: 0;
    margin: 1rem 0;
    overflow: hidden;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-foreground-4);
  }

  .markdown :global(ol) {
    list-style-type: decimal;
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .markdown :global(ul) {
    list-style-type: inherit;
    padding-left: 1.25rem;
    margin-bottom: 1rem;
  }
  .markdown :global(table) {
    margin: 1.5rem 0;
    border-collapse: collapse;
    border-radius: 0.5rem;
    border-style: hidden;
    box-shadow: 0 0 0 1px var(--color-foreground-4);
    overflow: hidden;
  }
  .markdown :global(td) {
    text-align: left;
    text-overflow: ellipsis;
    border: 1px solid var(--color-foreground-4);
    padding: 0.5rem 1rem;
  }
  .markdown :global(tr:nth-child(even)) {
    background-color: var(--color-foreground-2);
  }
  .markdown :global(th) {
    text-align: center;
    padding: 0.5rem 1rem;
  }

  .markdown :global(*:first-child:not(pre)) {
    padding-top: 0 !important;
  }
  .markdown :global(*:first-child) {
    margin-top: 0 !important;
  }
  .markdown :global(dl dt) {
    font-style: italic;
    margin-top: 1rem;
  }
  .markdown :global(dl dd) {
    margin: 0 0 0 2rem;
  }
</style>

{#if frontMatter.length > 0}
  <div class="front-matter">
    <table>
      {#each frontMatter as [key, val]}
        <tr>
          <td><span class="txt-bold">{key}</span></td>
          <td>{val}</td>
        </tr>
      {/each}
    </table>
  </div>
{/if}

<div class="markdown" bind:this={container}>
  {@html render(doc.content)}
</div>
