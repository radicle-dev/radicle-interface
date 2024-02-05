<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import Clipboard from "@app/components/Clipboard.svelte";

  export let id: string;
  export let style: "commit" | "oid";

  let clipboard: SvelteComponent;
</script>

<style>
  .id {
    cursor: pointer;
    color: var(--color-foreground-emphasized);
    overflow-wrap: anywhere;
    display: flex;
    align-items: center;
    gap: 0.125rem;
    width: fit-content;
  }
  .id:hover {
    color: var(--color-foreground-emphasized-hover);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  role="button"
  tabindex="0"
  on:click={() => {
    clipboard.copy();
  }}
  class="id">
  <span
    class="txt-overflow"
    class:global-commit={style === "commit"}
    class:global-oid={style === "oid"}
    style="color: inherit">
    <slot>{id}</slot>
  </span>
  <Clipboard bind:this={clipboard} text={id} />
</div>
