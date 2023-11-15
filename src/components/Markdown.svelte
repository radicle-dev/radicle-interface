<script lang="ts">
  import type { EmbedWithOid } from "@app/lib/file";

  import dompurify from "dompurify";
  import matter from "@radicle/gray-matter";
  import { afterUpdate } from "svelte";
  import { toDom } from "hast-util-to-dom";

  import * as router from "@app/lib/router";
  import markdown from "@app/lib/markdown";
  import { Renderer } from "@app/lib/markdown";
  import { highlight } from "@app/lib/syntax";
  import {
    isUrl,
    twemoji,
    scrollIntoView,
    canonicalize,
    isCommit,
  } from "@app/lib/utils";
  import { mimes } from "@app/lib/file";

  export let content: string;
  // If present, resolve all relative links with respect to this URL
  export let linkBaseUrl: string | undefined = undefined;
  export let path: string = "/";
  export let rawPath: string | undefined = undefined;
  // If present, means we are in a preview context,
  // use this for image previews instead of /raw URLs.
  export let embeds: EmbedWithOid[] | undefined = undefined;

  $: doc = matter(content);
  $: frontMatter = Object.entries(doc.data).filter(
    ([, val]) => typeof val === "string" || typeof val === "number",
  );
  let container: HTMLElement;

  /**
   * Do internal navigation on for clicks on anchor elements if possible
   */
  function navigateInternalOnAnchor(event: MouseEvent) {
    if (router.useDefaultNavigation(event)) {
      return;
    }

    let url: URL;
    if (!(event.target instanceof HTMLAnchorElement)) {
      return;
    }
    const href = event.target?.getAttribute("href");
    if (href === null || href.startsWith("#")) {
      return;
    }

    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (url.origin === window.origin) {
      event.preventDefault();
      void router.navigateToUrl("push", url);
    }
  }

  function render(content: string): string {
    return dompurify.sanitize(
      markdown.parse(content, {
        renderer: new Renderer(linkBaseUrl),
      }) as string,
    );
  }

  afterUpdate(async () => {
    // Don't underline <a> tags that contain images.
    for (const e of container.querySelectorAll("a")) {
      if (e.firstElementChild instanceof HTMLImageElement) {
        e.classList.add("no-underline");
      }
    }

    // If the embed is a preview stored in-memory.
    for (const i of container.querySelectorAll("img")) {
      const imagePath = i.getAttribute("src");

      // If the image is an oid embed
      if (imagePath && isCommit(imagePath)) {
        const embed = embeds?.find(e => {
          return e.oid === imagePath;
        });
        if (embed) {
          const fileExtension = embed.name.split(".").pop();
          if (fileExtension) {
            i.setAttribute("src", embed.content);
          }
        }
      }
    }

    // Iterate over all images, and replace the source with a canonicalized URL
    // pointing at the projects /raw endpoint.
    if (rawPath) {
      for (const i of container.querySelectorAll("img")) {
        const imagePath = i.getAttribute("src");

        // If the image is an oid embed
        if (imagePath && isCommit(imagePath)) {
          const fileExtension = i.alt.split(".").pop();
          const url = new URL(rawPath);
          // If a user changes the alt text of an image,
          // the browser is still able to infer the mime type.
          if (fileExtension && fileExtension in mimes) {
            url.search = `?mime=${mimes[fileExtension]}`;
          }
          url.pathname = canonicalize(`blobs/${imagePath}`, url.pathname);
          i.setAttribute("src", url.toString());
          continue;
        }

        // Make sure the source isn't a URL before trying to fetch it from the repo
        if (
          imagePath &&
          !isUrl(imagePath) &&
          !imagePath.startsWith(`${router.base}twemoji`)
        ) {
          i.setAttribute("src", `${rawPath}/${canonicalize(imagePath, path)}`);
        }
      }
    }

    // Replaces code blocks in the background with highlighted code.
    const prefix = "language-";
    const nodes = Array.from(document.body.querySelectorAll("pre code"));

    const treeChanges: Promise<void>[] = [];

    for (const node of nodes) {
      const preElement = node.parentElement as HTMLElement;
      const copyButton = document.createElement("radicle-clipboard");
      copyButton.setAttribute("text", node.textContent || "");
      copyButton.setAttribute("small", "");
      preElement.prepend(copyButton);

      const className = Array.from(node.classList).find(name =>
        name.startsWith(prefix),
      );
      if (!className) continue;

      treeChanges.push(
        highlight(node.textContent ?? "", className.slice(prefix.length))
          .then(tree => {
            if (tree) {
              node.replaceChildren(toDom(tree, { fragment: true }));
            }
          })
          .catch(e => console.warn("Not able to highlight code block", e)),
      );
    }

    await Promise.allSettled(treeChanges);

    if (window.location.hash) {
      scrollIntoView(window.location.hash.substring(1));
    }
  });
</script>

<style>
  :global(html) {
    scroll-padding-top: 4rem;
  }
  .front-matter {
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    border: 1px dashed var(--color-border-default);
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

  .markdown :global(h1) {
    font-size: calc(var(--font-size-x-large) * 0.75);
    font-weight: var(--font-weight-semibold);
    padding: 1rem 0 0.5rem 0;
    margin: 0 0 0.75rem;
    border-bottom: 1px solid var(--color-border-hint);
  }

  .markdown :global(h2) {
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-regular);
    padding: 0.25rem 0;
    margin: 2rem 0 0.5rem;
    border-bottom: 1px solid var(--color-border-hint);
  }

  .markdown :global(radicle-clipboard) {
    display: none;
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
  }

  .markdown :global(radicle-clipboard) {
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-small);
  }

  .markdown :global(pre:hover radicle-clipboard) {
    display: flex;
  }

  .markdown :global(h3) {
    font-size: calc(var(--font-size-medium) * 0.9);
    font-weight: var(--font-weight-semibold);
    padding: 0.5rem 0;
    margin: 1rem 0 0.25rem;
  }

  .markdown :global(h4) {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-regular);
    padding: 0.5rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h5),
  .markdown :global(h6) {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    padding: 0.35rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h6) {
    color: var(--color-foreground-gray);
  }

  .markdown :global(p) {
    line-height: 1.625rem;
    margin-top: 0;
    margin-bottom: 0.625rem;
  }

  .markdown :global(p:only-child) {
    margin-bottom: 0;
  }

  .markdown :global(blockquote) {
    color: var(--color-foreground-gray);
    border-left: 0.3rem solid var(--color-fill-ghost);
    padding: 0 0 0 1rem;
    margin: 1rem 0 1rem 0;
  }

  .markdown :global(strong) {
    font-weight: var(--font-weight-semibold);
  }

  .markdown :global(.footnote-ref > a),
  .markdown :global(a.ref-arrow) {
    border-bottom: none;
    color: unset;
  }

  .markdown :global(img) {
    border-style: none;
    max-width: 100%;
  }

  .markdown :global(code) {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-tiny);
    padding: 0.125rem 0.25rem;
  }

  .markdown :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown :global(:not(pre) code) {
    font-size: inherit;
  }

  .markdown :global(pre) {
    position: relative;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-regular);
    background-color: var(--color-fill-ghost);
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
  }
  .markdown :global(a) {
    text-decoration: none;
    border-bottom: 1px solid var(--color-foreground-contrast);
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
    border-bottom: 1px solid var(--color-border-hint);
  }

  .markdown :global(ol) {
    line-height: 1.625;
    list-style-type: decimal;
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .markdown :global(ul) {
    line-height: 1.625;
    list-style-type: inherit;
    padding-left: 1.25rem;
    margin-bottom: 1rem;
  }
  .markdown :global(.list-content) {
    margin: 1rem 0;
  }
  /* Allows the parent to specify its own bottom margin */
  .markdown :global(> :last-child) {
    margin-bottom: 0;
  }
  .markdown :global(li > ul) {
    margin-bottom: 0rem;
  }
  .markdown :global(li > ol) {
    margin-bottom: 0rem;
  }
  .markdown :global(table) {
    margin: 1.5rem 0;
    border-collapse: collapse;
    border-radius: 0.5rem;
    border-style: hidden;
    box-shadow: 0 0 0 1px var(--color-border-hint);
    overflow: hidden;
  }
  .markdown :global(td) {
    text-align: left;
    text-overflow: ellipsis;
    border: 1px solid var(--color-border-hint);
    padding: 0.5rem 1rem;
  }
  .markdown :global(tr:nth-child(even)) {
    background-color: var(--color-background-default);
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

<!-- The click handler only handles bubbling events from anchor tags -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="markdown"
  bind:this={container}
  use:twemoji={{ exclude: ["21a9"] }}
  on:click={navigateInternalOnAnchor}>
  {@html render(doc.content)}
</div>
