<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  import Loading from "@app/Loading.svelte";

  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string | undefined = undefined;

  export let variant: "regular" | "dashed" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let valid: boolean = false;
  export let validationMessage: string | undefined = undefined;

  const dispatch = createEventDispatcher<{
    submit: never;
  }>();

  let rightContainerWidth: number;
  let inputElement: HTMLInputElement | undefined = undefined;

  onMount(() => {
    if (autofocus && inputElement) {
      // We set preventScroll to true for Svelte animations to work.
      inputElement.focus({ preventScroll: true });
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      dispatch("submit");
    }
  }
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
    flex: 1;
    height: 2.5rem;
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
    width: 100%;
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
    gap: 0.5rem;
  }
  .validation-message {
    color: var(--color-negative);
    font-size: var(--font-size-small);
    margin-left: 1rem;
    position: relative;
    margin-top: 0.5rem;
  }
  .validation-wrapper {
    position: absolute;
    width: 100%;
  }

  .key-hint {
    border-radius: 0.25rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    padding: 0 0.5rem;
  }
</style>

<div class="wrapper">
  <div class="validation-wrapper">
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
      on:keydown|stopPropagation={handleKeydown}
      on:click
      on:change />

    <div class="right-container" bind:clientWidth={rightContainerWidth}>
      {#if $$slots.right}
        <slot name="right" />
      {/if}

      {#if loading}
        <Loading small noDelay />
      {/if}

      {#if valid && !loading}
        <div class="key-hint">⏎</div>
      {/if}
    </div>

    {#if validationMessage}
      <div class="validation-message">
        {validationMessage}
      </div>
    {/if}
  </div>
</div>
