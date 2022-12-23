<script lang="ts">
  // Use this component if you need an emoji that is reactive. For static
  // emojis use the `twemoji` action from the utils module.

  import twemoji from "twemoji";
  import { base } from "@app/lib/router";

  export let emoji: string;
</script>

{@html twemoji.parse(emoji, {
  base,
  folder: "twemoji",
  ext: ".svg",
  className: "txt-emoji",
})}
