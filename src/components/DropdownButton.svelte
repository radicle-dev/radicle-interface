<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import Icon from "./Icon.svelte";
  import { createEventDispatcher } from "svelte";

  export let title: string | undefined = undefined;
  export let variant:
    | "foreground"
    | "negative"
    | "primary"
    | "secondary"
    | "text";
  export let size: "tiny" | "small" | "regular" = "regular";
  export let autofocus: boolean = false;
  export let disabled: boolean = false;
  export let waiting: boolean = false;

  const dispatch = createEventDispatcher<{ toggle: never }>();

  const attachableStyle = `border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;`;
</script>

<style>
  .main {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .toggle {
    cursor: pointer;
    border: 1px solid var(--color-foreground);
    border-radius: var(--border-radius-round);
    border-top-left-radius: 0;
    height: var(--button-small-height);
    background: transparent;
    color: var(--color-foreground);
    border-bottom-left-radius: 0;
    line-height: 1.6rem;
    font-size: var(--font-size-regular);
    padding: 0 0.2rem;
  }
  .toggle:not([disabled]):hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
</style>

<div class="main">
  <Button
    {title}
    {variant}
    {autofocus}
    {disabled}
    {waiting}
    {size}
    on:click
    style={attachableStyle}>
    <slot />
  </Button>
  <button class="toggle" on:click={() => dispatch("toggle")}>
    <Icon name="chevron-down" />
  </button>
</div>
