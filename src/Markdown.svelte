<script lang="ts">
  // Ok this is something horrible, but I wanted to make it pass and it's the nicest way I found to make it work.
  // TODO: Before merging this I'll have worked it out.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { marked } = require("marked");
  import { onMount } from "svelte";
  import sanitizeHtml from 'sanitize-html';

  export let content: string;

  let container: HTMLElement;

  const sanitize = (content: string): string => {
    return sanitizeHtml(marked.parse(content), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "audio",
        "video",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        video: ["src"],
        audio: ["src"],
      },
      disallowedTagsMode: "escape",
    });
  };

  onMount(() => {
    // Don't underline <a> tags that contain images.
    let elems = container.querySelectorAll("a");

    for (let e of elems) {
      if (e.firstElementChild instanceof HTMLImageElement) {
        e.classList.add("no-underline");
      }
    }
  });
</script>

<style>
  .markdown :global(h1), .markdown :global(h2), .markdown :global(h3),
  .markdown :global(h4), .markdown :global(h5), .markdown :global(h6) {
    color: var(--color-foreground);
  }

  .markdown :global(*:first-child) {
    padding-top: 0;
    margin-top: 0;
  }

  .markdown :global(h1) {
    font-family: var(--typeface-medium);
    font-size: 1.5rem;
    font-weight: var(--font-weight-medium);
    padding: 1rem 0 0.5rem 0;
    margin: 0 0 0.75rem;
    border-bottom: 1px solid var(--color-foreground-subtle);
  }

  .markdown :global(h2) {
    font-size: 1.25rem;
    font-weight: normal;
    padding: 0.25rem 0;
    margin: 2rem 0 0.5rem;
    border-bottom: 1px dashed var(--color-foreground-subtle);
  }

  .markdown :global(h3) {
    font-size: 1.125rem;
    font-weight: var(--font-weight-medium);
    padding: 0.5rem 0;
    margin: 1rem 0 0.25rem;
  }

  .markdown :global(h4) {
    font-weight: var(--font-weight-medium);
    font-size: 1rem;
    padding: 0.5rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h5) {
    font-weight: var(--font-weight-medium);
    font-size: 0.875rem;
    padding: 0.35rem 0;
    margin: 1rem 0 0.125rem;
  }

  .markdown :global(h6) {
    font-weight: var(--font-weight-medium);
    font-size: 0.75rem;
    padding: 0.25rem 0;
    margin: 1rem 0 0.125rem;
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
    font-style: italic;
    padding: 0.625rem 0;
    margin: 0;
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
    font-size: 1rem;
    color: var(--color-light);
  }

  .markdown :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown :global(pre) {
    font-family: var(--font-family-monospace);
    font-size: 1rem;
    background-color: var(--color-foreground-background);
    padding: 1rem !important;
    border-radius: 0.25rem;
    margin: 1rem 0;
    overflow: scroll;
    scrollbar-width: none;
  }

  .markdown :global(pre::-webkit-scrollbar) {
    display: none;
  }

  .markdown :global(a), .markdown :global(a > code) {
    background: none;
    padding: 0;
    color: var(--color-foreground);
  }
  .markdown :global(a) {
    text-decoration: none;
    border-bottom: 1px solid var(--color-foreground-90);
  }
  .markdown :global(a.no-underline) {
    border-bottom: none;
  }

  .markdown :global(hr) {
    height: 0;
    margin: 0rem 0;
    overflow: hidden;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-foreground-faded);
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
</style>

{#if content}
  <div class="markdown" bind:this={container}>
    {@html marked(sanitize(content))}
  </div>
{/if}
