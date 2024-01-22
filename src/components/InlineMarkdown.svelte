<script lang="ts">
  import dompurify from "dompurify";

  import markdown from "@app/lib/markdown";
  import { twemoji } from "@app/lib/utils";
  import { Renderer } from "@app/lib/markdown";

  export let content: string;
  export let stripEmphasizedStyling: boolean = false;
  export let fontSize: "tiny" | "small" | "regular" | "medium" | "large" =
    "small";

  const render = (content: string): string =>
    dompurify.sanitize(
      markdown.parseInline(content, {
        renderer: new Renderer(undefined, stripEmphasizedStyling),
      }) as string,
    );
</script>

<style>
  .markdown :global(code) {
    font-family: var(--font-family-monospace);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-tiny);
    padding: 0.125rem 0.25rem;
  }
  .markdown :global(strong) {
    font-weight: var(--font-weight-semibold);
  }
</style>

<span
  class="markdown"
  use:twemoji
  class:txt-large={fontSize === "large"}
  class:txt-medium={fontSize === "medium"}
  class:txt-regular={fontSize === "regular"}
  class:txt-small={fontSize === "small"}
  class:txt-tiny={fontSize === "tiny"}>
  {@html render(content)}
</span>
