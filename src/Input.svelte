<script lang="ts">
  import Clipboard from '@app/Clipboard.svelte';

  export let name: string;
  export let value: string;
  export let small = false;
  export let clipboard = false;
</script>

<style>
  main {
    display: flex;
  }
  .clipboard {
    visibility: hidden;
    margin-left: -4rem;
    width: 4rem;
    text-align: right;
    -webkit-mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    border-radius: 0 0.25rem 0.25rem 0;
  }
  input {
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    border: none;
    outline: none;
    width: 100%;
    text-overflow: ellipsis !important;
    border-radius: 0.25rem;
  }
  main:hover .clipboard {
    visibility: visible;
  }
</style>

<main>
  <input class={$$props.class} readonly={clipboard} {name} {value} />
  {#if clipboard}
    <span class="clipboard {$$props.class}">
      <Clipboard text={value} {small} />
    </span>
  {/if}
</main>
