<script lang="ts">
  import dompurify from "dompurify";
  import { marked } from "marked";

  import { twemoji } from "@app/lib/utils";

  export let content: string;
  export let fontSize: "tiny" | "small" | "medium" = "small";

  const render = (content: string): string =>
    dompurify.sanitize(marked.parseInline(content));
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
