<script lang="ts">
  import { onMount } from "svelte";

  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string | undefined = undefined;

  export let variant: "regular" | "dashed" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;

  let rightContainerWidth: number;
  let inputElement: HTMLInputElement | undefined = undefined;
  onMount(() => {
    if (autofocus && inputElement) {
      // We set preventScroll to true for Svelte animations to work.
      inputElement.focus({ preventScroll: true });
    }
  });
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
  }
  input {
    background: transparent;
    border-radius: var(--border-radius-round);
    color: var(--color-foreground);
    font-family: var(--font-family-sans-serif);
    height: var(--button-regular-height);
    line-height: 1.6;
    margin: 0;
    outline: none;
    text-overflow: ellipsis;
  }
  input::placeholder {
    color: var(--color-secondary);
    opacity: 1 !important;
  }
  input[disabled] {
    color: var(--color-secondary);
    cursor: not-allowed;
  }
  .regular {
    border: 1px solid var(--color-secondary);
    font-size: var(--font-size-regular);
    padding: 1rem 1.5rem;
  }
  .dashed {
    border: 1px dashed var(--color-secondary);
    font-size: var(--font-size-small);
    padding: 0.5rem 1.25rem;
  }
  .right-container {
    color: var(--color-secondary);
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    padding-right: 1rem;
    padding-left: 0.5rem;
  }
</style>

<div class="wrapper">
  <input
    class:regular={variant === "regular"}
    class:dashed={variant === "dashed"}
    style:padding-right={rightContainerWidth
      ? `${rightContainerWidth}px`
      : "auto"}
    bind:this={inputElement}
    type="text"
    {name}
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:keydown
    on:click
    on:change />

  {#if $$slots.right}
    <div class="right-container" bind:clientWidth={rightContainerWidth}>
      <slot name="right" />
    </div>
  {/if}
</div>
