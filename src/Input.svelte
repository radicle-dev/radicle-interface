<script lang="ts">
  import Clipboard from "@app/Clipboard.svelte";
  import { closeFocused } from "@app/Floating.svelte";

  export let name: string;
  export let value: string;
  export let small = false;
</script>

<style>
  .wrapper {
    display: flex;
    align-items: center;
  }
  .clipboard {
    visibility: hidden;
    margin-left: -4rem;
    width: 4rem;
    height: 2rem;
    text-align: right;
    -webkit-mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
    color: var(--color-caution-6);
    background: linear-gradient(var(--color-caution-2), var(--color-caution-2)),
      linear-gradient(var(--color-background), var(--color-background));
  }
  input {
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    padding: 0.5rem;
    border: none;
    outline: none;
    width: 100%;
    height: 2rem;
    text-overflow: ellipsis !important;
    border-radius: var(--border-radius-small);
    color: var(--color-caution-6);
    background: linear-gradient(var(--color-caution-2), var(--color-caution-2)),
      linear-gradient(var(--color-background), var(--color-background));
  }
  .wrapper:hover .clipboard {
    visibility: visible;
  }
</style>

<div class="wrapper">
  <input readonly {name} {value} />
  <span class="clipboard">
    <Clipboard text={value} {small} on:copied={closeFocused} />
  </span>
</div>
