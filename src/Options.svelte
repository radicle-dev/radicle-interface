<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let options: { label: string; value: string }[];
  export let name: string;
  export let selected = "";
  export let disabled = false;

  const dispatch = createEventDispatcher();
</script>

<style>
  main {
    display: flex;
    justify-content: center;
  }
  .options {
    text-align: left;
  }
  .options label {
    display: block;
    margin-bottom: 1rem;
    line-height: 1.5rem;
    width: 100%;
  }
  .options label:last-child {
    margin-bottom: 0.5rem;
  }
  .options label, .options input {
    cursor: pointer;
  }
  .options input {
    margin-right: 0.75rem;
    display: inline-block;
  }
</style>

<main>
  <div class="options">
    {#each options as option}
      <label for="{option.value}">
        <input type="radio" {disabled} checked={selected === option.value} {name}
               id="{option.value}" value="{option.value}"
               on:click={() => dispatch('changed', option.value)}>
        {option.label}
      </label>
    {/each}
  </div>
</main>
