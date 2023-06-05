<script lang="ts">
  import Clipboard from "@app/components/Clipboard.svelte";

  export let command: string;
  export let color: "caution" | "foreground" = "foreground";
</script>

<style>
  .wrapper {
    display: flex;
  }
  .cmd {
    background-color: var(--color-foreground-3);
    border-radius: var(--border-radius-small);
    display: inline-block;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    margin-top: 0.5rem;
    overflow: hidden;
    padding: 2px 0.5rem;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .clipboard {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-image: linear-gradient(
      -90deg,
      var(--color-foreground-2),
      var(--color-foreground-2),
      transparent
    );
    position: absolute;
    right: 0;
    top: 0;
    visibility: hidden;
    width: 3rem;
    height: 100%;
  }
  .cmd:hover .clipboard {
    visibility: visible;
  }
  .caution {
    background-color: var(--color-caution-3);
    color: var(--color-caution-6);
  }
  .caution .clipboard {
    background: linear-gradient(var(--color-caution-3), var(--color-caution-3)),
      linear-gradient(var(--color-background), var(--color-background));
    -webkit-mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    mask: linear-gradient(90deg, transparent 0%, #fff 50%);
  }
</style>

<div class="wrapper">
  <div class="cmd" class:caution={color === "caution"}>
    {command}
    <div class="clipboard">
      <Clipboard text={command} small />
    </div>
  </div>
</div>
