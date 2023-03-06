<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  import Loading from "@app/components/Loading.svelte";

  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string | undefined = undefined;

  export let variant: "regular" | "form" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let valid: boolean = false;
  // Changes the background color to the background of the page
  export let transparent: boolean = false;
  export let validationMessage: string | undefined = undefined;

  const dispatch = createEventDispatcher<{
    submit: never;
  }>();

  let rightContainerWidth: number;
  let leftContainerWidth: number;
  let inputElement: HTMLInputElement | undefined = undefined;

  onMount(() => {
    if (autofocus && inputElement) {
      // We set preventScroll to true for Svelte animations to work.
      inputElement.focus({ preventScroll: true });
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && valid) {
      dispatch("submit");
    }

    if (event.key === "Escape") {
      inputElement?.blur();
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
    font-size: inherit;
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
  .transparent {
    background: var(--color-background) !important;
  }
  .regular {
    border: 1px solid var(--color-secondary);
    padding: 1rem 1.5rem;
  }
  .form {
    background: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-foreground-1);
  }
  .form::placeholder {
    color: var(--color-foreground-5);
  }
  .form:focus,
  .form:hover {
    border: 1px solid var(--color-foreground-4);
  }
  .left-container {
    color: var(--color-secondary);
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    gap: 0.5rem;
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
    color: var(--color-foreground-6);
    background-color: var(--color-secondary-1);
    border: 1px solid var(--color-secondary-5);
    border-radius: 6px;
    box-shadow: inset 0 -3px 0 var(--color-secondary-5);
    padding: 0 5px;
  }
</style>

<div class="wrapper">
  <div class="validation-wrapper">
    <div class="left-container" bind:clientWidth={leftContainerWidth}>
      {#if $$slots.left}
        <slot name="left" />
      {/if}
    </div>

    <input
      class:transparent
      class:regular={variant === "regular"}
      class:form={variant === "form"}
      style:padding-left={leftContainerWidth
        ? `${leftContainerWidth}px`
        : "auto"}
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
      on:focus
      on:blur
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
