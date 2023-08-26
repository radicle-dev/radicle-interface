<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;
  export let color: "caution" | "foreground" = "foreground";
</script>

<style>
  .cmd {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .caution {
    background-color: var(--color-caution-3);
    color: var(--color-caution-6);
  }
  /* .caution .clipboard {
    background: linear-gradient(var(--color-caution-3), var(--color-caution-3)),
      linear-gradient(var(--color-background), var(--color-background));
    -webkit-mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    mask: linear-gradient(90deg, transparent 0%, #fff 50%);
  } */
</style>

<div class="cmd" class:caution={color === "caution"}>
  <Clipboard withText text={command} />
</div>
