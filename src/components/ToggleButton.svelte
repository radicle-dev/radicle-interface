<script lang="ts" context="module">
  export interface ToggleButtonOption<T> {
    title?: string;
    count?: number;
    value: T;
  }
</script>

<script lang="ts" strictEvents>
  type T = $$Generic;

  import { createEventDispatcher } from "svelte";
  import { capitalize } from "@app/lib/utils";

  export let options: ToggleButtonOption<T>[];
  export let active: T;

  const dispatch = createEventDispatcher<{ select: T }>();

  function onSelect(option: ToggleButtonOption<T>) {
    if (option.count !== 0) {
      dispatch("select", option.value);
    }
  }
</script>

<style>
  .wrapper {
    display: flex;
    gap: 1rem;
    user-select: none;
  }
  button {
    border-radius: var(--border-radius-small);
    color: var(--color-foreground-6);
    cursor: pointer;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    height: var(--button-tiny-height);
    padding: 0.25rem 0.5rem;
    border: none;
    min-width: 0;
    background-color: var(--color-background);
  }
  button:hover,
  button.active {
    cursor: pointer;
    color: var(--color-foreground);
    background-color: var(--color-foreground-1);
  }
  button[disabled],
  button[disabled]:hover {
    cursor: not-allowed;
    color: var(--color-foreground-6);
  }
</style>

<div class="wrapper">
  {#each options as option}
    <button
      class="state-toggle"
      on:click={() => onSelect(option)}
      disabled={option.count === 0}
      class:active={active === option.value}>
      {#if option.count !== undefined}
        {option.count}
      {/if}
      {option.title ?? capitalize(`${option.value}`)}
    </button>
  {/each}
</div>
