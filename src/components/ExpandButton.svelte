<script lang="ts">
  import Icon from "./Icon.svelte";

  export let expanded: boolean = true;
  export let variant: "regular" | "foreground" = "regular";
</script>

<style>
  button {
    cursor: pointer;
    user-select: none;
    border: 0;
    margin: 0;
    padding: 0;
    border-radius: var(--border-radius-tiny);
  }

  .regular {
    color: var(--color-foreground-dim);
    background: none;
  }

  .regular:hover {
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost);
  }

  .foreground {
    color: var(--color-foreground-dim);
    background: none;
  }

  .foreground:hover {
    color: var(--color-foreground-contrast);
    background-color: var(--color-fill-ghost-hover);
  }
</style>

<button
  class="expand"
  class:regular={variant === "regular"}
  class:foreground={variant === "foreground"}
  on:click={() => (expanded = !expanded)}>
  {#if expanded}
    <Icon name="chevron-up" />
  {:else}
    <Icon name="chevron-down" />
  {/if}
</button>
