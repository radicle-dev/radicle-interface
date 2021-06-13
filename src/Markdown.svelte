<script lang="typescript">
  import marked from "marked";

  export let content: string;
</script>

<style>
  .markdown :global(h1, h2, h3, h4, h5, h6) {
    color: var(--color-foreground-90);
  }

  .markdown :global(h1) {
    font-family: var(--typeface-medium);
    font-size: 1.75rem;
    font-weight: var(--font-weight-medium);
    padding: 1rem 0;
    margin: 0 0 0.5rem;
  }

  .markdown :global(h2) {
    font-size: 1.5rem;
    font-weight: var(--font-weight-medium);
    padding: 0.75rem 0;
    margin: 1.8rem 0 0.5rem;
  }

  .markdown :global(h3) {
    font-weight: var(--font-weight-medium);
    font-size: 1.25rem;
    padding: 0.65rem 0;
    margin: 1.75rem 0 0.25rem;
  }

  .markdown :global(h4) {
    font-weight: var(--font-weight-medium);
    font-size: 1rem;
    padding: 0.5rem 0;
    margin: 1.5rem 0 0.125rem;
  }

  .markdown :global(h5) {
    font-weight: var(--font-weight-medium);
    font-size: 0.875rem;
    padding: 0.35rem 0;
    margin: 1.35rem 0 0.125rem;
  }

  .markdown :global(h6) {
    font-weight: var(--font-weight-medium);
    font-size: 0.75rem;
    padding: 0.25rem 0;
    margin: 1.25rem 0 0.125rem;
  }

  .markdown :global(p) {
    margin-top: 0;
    margin-bottom: 0.625rem;
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
    background-color: var(--color-foreground-background);
    padding: 1px 0.25rem;
    border-radius: 0.25rem;
  }

  .markdown :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown :global(pre) {
    font-family: var(--font-family-monospace);
    font-size: 1rem;
    background-color: var(--color-foreground-background);
    padding: 1rem;
    border-radius: 0.25rem;
    margin: 1rem 0;
    overflow: scroll;
    scrollbar-width: none;
  }

  .markdown :global(pre::-webkit-scrollbar) {
    display: none;
  }

  .markdown :global(a), .markdown :global(a > code) {
    color: var(--color-tertiary-faded);
    text-decoration: none;
  }
  .markdown :global(a:hover) {
    text-decoration: underline;
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
  <div class="markdown">
    {@html marked(content)}
  </div>
{/if}
