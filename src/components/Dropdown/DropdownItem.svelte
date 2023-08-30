<script lang="ts">
  export let selected: boolean;
  export let title: string | undefined = undefined;
  export let size: "small" | "tiny";
</script>

<style>
  .item {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.5rem;
    white-space: nowrap;
    /* makes sure peer selector items with badges are same height
       as ones without */
    height: 34px;
  }
  .item:hover,
  .selected {
    background-color: var(--color-fill-ghost);
  }

  .item:hover.selected {
    background-color: var(--color-fill-ghost-hover);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="item"
  class:selected
  {title}
  on:click
  class:txt-small={size === "small"}
  class:txt-tiny={size === "tiny"}>
  <slot />
</div>
