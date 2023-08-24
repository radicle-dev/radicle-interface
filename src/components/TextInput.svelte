<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  import IconSmall from "@app/components/IconSmall.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import Loading from "@app/components/Loading.svelte";

  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string | undefined = undefined;

  export let size: "regular" | "small" = "regular";

  export let autofocus: boolean = false;
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let valid: boolean = true;
  export let validationMessage: string | undefined = undefined;
  export let showKeyHint: boolean = true;

  const dispatch = createEventDispatcher<{
    blur: FocusEvent;
    focus: FocusEvent;
    submit: null;
  }>();

  let rightContainerWidth: number;
  let leftContainerWidth: number;
  let inputElement: HTMLInputElement | undefined = undefined;
  let isFocused = false;
  let success = false;

  onMount(() => {
    if (autofocus && inputElement) {
      // We set preventScroll to true for Svelte animations to work.
      inputElement.focus({ preventScroll: true });
    }
  });

  const restoreIcon = debounce(() => {
    success = false;
  }, 800);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && valid) {
      success = true;
      dispatch("submit");
      restoreIcon();
    }

    if (event.key === "Escape") {
      inputElement?.blur();
    }
  }

  function handleFocusEvent(e: FocusEvent) {
    if (isFocused) {
      dispatch("blur", e);
    } else {
      dispatch("focus", e);
    }
    isFocused = !isFocused;
  }
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    margin: 0;
    position: relative;
    flex: 1;
    align-items: center;
    height: var(--button-regular-height);
    background: var(--color-background-dip);
    font-size: var(--font-size-small);
  }
  input {
    background: var(--color-background-dip);
    color: var(--color-foreground-contrast);
    font-family: var(--font-family-monospace);
    border: 1px solid var(--color-border-hint);
    line-height: 1.6;
    outline: none;
    text-overflow: ellipsis;
    width: 100%;
    height: 100%;
    padding-left: 0.75rem;
    margin: 0;
  }
  input::placeholder {
    font-family: var(--font-family-sans-serif);
    color: var(--color-foreground-dim);
    opacity: 1 !important;
  }
  input:hover:not(.invalid) {
    border: 1px solid var(--color-border-default);
  }
  input:hover:not(.invalid) + .right-container {
    border-top: 1px solid var(--color-border-default);
    border-right: 1px solid var(--color-border-default);
    border-bottom: 1px solid var(--color-border-default);
    color: var(--color-fill-contrast);
  }
  input:focus:not(.invalid) + .right-container {
    border-top: 1px solid var(--color-fill-secondary);
    border-right: 1px solid var(--color-fill-secondary);
    border-bottom: 1px solid var(--color-fill-secondary);
    color: var(--color-fill-contrast);
  }
  input:focus:not(.invalid) {
    border: 1px solid var(--color-fill-secondary);
  }
  input[disabled] {
    cursor: not-allowed;
  }
  .left-container {
    color: var(--color-fill-secondary);
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    gap: 0.5rem;
    height: 100%;
  }
  .right-container {
    border: 1px solid transparent;
    color: var(--color-fill-gray);
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    overflow: hidden;
    height: 100%;
  }
  .validation-message {
    color: var(--color-foreground-red);
    position: relative;
    margin-top: 0.5rem;
  }
  .validation-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .invalid {
    border: 1px solid var(--color-border-error);
  }

  .small {
    height: var(--button-small-height);
  }
  .small input {
    border-radius: var(--border-radius-tiny);
  }
  .small .right-container {
    border-top-right-radius: var(--border-radius-tiny);
    border-bottom-right-radius: var(--border-radius-tiny);
    gap: 0.25rem;
  }

  .regular {
    height: var(--button-regular-height);
  }
  .regular input {
    border-radius: var(--border-radius-small);
  }
  .regular .right-container {
    border-top-right-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
    padding-right: 0.5rem;
    gap: 0.5rem;
  }
</style>

<div
  class="wrapper"
  class:small={size === "small"}
  class:regular={size === "regular"}>
  <div class="validation-wrapper">
    {#if $$slots.left}
      <div class="left-container" bind:clientWidth={leftContainerWidth}>
        <slot name="left" />
      </div>
    {/if}

    <input
      class:invalid={!valid && value}
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
      on:focus={handleFocusEvent}
      on:blur={handleFocusEvent}
      on:keydown|stopPropagation={handleKeydown}
      on:click
      on:change />

    <div
      class="right-container"
      class:small={size === "small"}
      bind:clientWidth={rightContainerWidth}>
      {#if loading}
        <Loading small noDelay />
      {/if}

      {#if valid && !loading && isFocused && showKeyHint}
        {#if success}
          <IconSmall name="checkmark" />
        {:else}
          <KeyHint>⏎</KeyHint>
        {/if}
      {/if}

      {#if $$slots.right}
        <slot name="right" />
      {/if}
    </div>

    {#if !valid && validationMessage}
      <div class="validation-message">
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          <IconSmall name="exclamation-circle" />{validationMessage}
        </div>
      </div>
    {/if}
  </div>
</div>
