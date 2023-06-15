<script lang="ts">
  import dompurify from "dompurify";
  import { marked } from "marked";

  import { renderer, walkTokens } from "@app/lib/markdown";
  import { twemoji } from "@app/lib/utils";

  export let content: string;
  export let fontSize: "tiny" | "small" | "medium" = "small";

  marked.use({
    walkTokens,
    renderer,
    // TODO: Disables deprecated options, remove once removed from marked
    mangle: false,
    headerIds: false,
  });

  const render = (content: string): string =>
    // eslint-disable-next-line @typescript-eslint/naming-convention
    dompurify.sanitize(marked.parseInline(content), { SANITIZE_DOM: false });
</script>

<style>
  .markdown :global(code) {
    font-family: var(--font-family-monospace);
    color: var(--color-foreground-6);
    background-color: var(--color-foreground-3);
    border-radius: 0.5rem;
    padding: 0.125rem 0.25rem;
  }
</style>

<span
  class="markdown"
  use:twemoji
  class:txt-medium={fontSize === "medium"}
  class:txt-small={fontSize === "small"}
  class:txt-tiny={fontSize === "tiny"}>
  {@html render(content)}
</span>
