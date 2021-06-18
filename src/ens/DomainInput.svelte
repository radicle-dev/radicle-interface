<script lang="ts">
  import { onMount } from 'svelte';

  export let root: string;
  export let placeholder = "";
  export let disabled = false;
  export let value = "";
  export let autofocus = false;

  let element: HTMLInputElement;

  onMount(() => {
    if (autofocus) {
      element.focus();
    }
  });
</script>

<style>
  span.root {
    line-height: 1.5em;
    margin: 1rem;
    margin-left: 0;
    margin-right: 0;
	padding: 1rem 2rem;
    color: var(--color-secondary);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    border: 1px solid var(--color-secondary);
    border-left: none;
  }
  input {
    margin: 0;
    margin-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    border-right: none;
  }
  input[disabled] {
    color: var(--color-secondary);
  }
  main {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
</style>

<main>
  <input
    type="text"
    {disabled}
    {placeholder}
    bind:this={element}
    bind:value={value}
    on:input
    on:click
  />
  <span class="root">.{root}</span>
</main>
