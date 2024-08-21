<script lang="ts">
  import dompurify from "dompurify";
  import escape from "lodash/escape";
  import { formatInlineTitle } from "@app/lib/utils";

  export let content: string;
  export let fontSize: "tiny" | "small" | "regular" | "medium" | "large" =
    "small";
</script>

<style>
  .content :global(code) {
    font-family: var(--font-family-monospace);
    background-color: var(--color-fill-ghost);
    border-radius: var(--border-radius-tiny);
    padding: 0.125rem 0.25rem;
  }
</style>

<span
  class="content"
  class:txt-large={fontSize === "large"}
  class:txt-medium={fontSize === "medium"}
  class:txt-regular={fontSize === "regular"}
  class:txt-small={fontSize === "small"}
  class:txt-tiny={fontSize === "tiny"}>
  {@html dompurify.sanitize(formatInlineTitle(escape(content)))}
</span>
