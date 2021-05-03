<script lang="typescript">
  import { derived } from "svelte/store";
  import { Connection } from "@app/session";
  import { state } from '@app/session';

  export let config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  $: connecting = $state.connection === Connection.Connecting;
</script>

<style>
</style>

<button
  on:click={() => state.connect(config)}
  {style}
  class="connect {className}"
  disabled={connecting || walletUnavailable}
  data-waiting={connecting || null}
>
  {#if connecting}
    Connecting...
  {:else}
    {caption}
  {/if}
</button>
