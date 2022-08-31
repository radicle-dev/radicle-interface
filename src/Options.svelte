<script lang="ts">
  import { marked } from "marked";
  import { createEventDispatcher } from "svelte";

  export let options: {
    label: string;
    value: string;
    description?: string[];
  }[];
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
  .options label,
  .options input {
    cursor: pointer;
  }
  .options input {
    margin-right: 0.75rem;
    display: inline-block;
  }
  .options .description {
    color: var(--color-secondary);
    font-size: 0.875rem;
    margin-bottom: 2rem;
  }
  .options .description:last-child {
    margin-bottom: 0;
  }
  .description :global(a) {
    text-decoration: underline;
  }
  .description :global(em) {
    font-style: italic;
  }
  .description :global(strong) {
    font-weight: var(--font-weight-medium);
  }
  .desktop {
    display: block !important;
  }
  @media (max-width: 720px) {
    .desktop {
      display: none !important;
    }
  }
</style>

<main>
  <div class="options">
    {#each options as option}
      <label for={option.value}>
        <input
          type="radio"
          {disabled}
          checked={selected === option.value}
          {name}
          id={option.value}
          value={option.value}
          on:click={() => dispatch("changed", option.value)} />
        {option.label}
      </label>
      {#if option.description}
        <div class="description desktop">
          {@html marked(option.description.join("\n"))}
        </div>
      {/if}
    {/each}
  </div>
</main>
