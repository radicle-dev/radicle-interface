<script lang="ts">
  import * as httpd from "@app/lib/httpd";

  import TextInput from "@app/components/TextInput.svelte";

  export let port: string;

  $: validPortNumber = Number(port) > 0 && Number(port) <= 65535;
</script>

<style>
  .item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem 1rem 0.5rem 1rem;
    justify-content: space-between;
    border-top: 1px solid var(--color-foreground-3);
    height: 2.5rem;
    font-size: var(--font-size-small);
  }
</style>

<div class="item">
  <span>Port</span>
  <div style:width="6.5rem">
    <TextInput
      name="port"
      size="small"
      variant="modal"
      bind:value={port}
      valid={validPortNumber}
      on:submit={() => httpd.changeHttpdPort(Number(port))} />
  </div>
</div>
