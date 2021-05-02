<script lang="typescript">
  import { derived } from "svelte/store";
  import { Connection, session, connectWallet } from "./session";

  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  $: connecting = $session.connection === Connection.Connecting;
</script>

<style>
</style>

<button
  on:click={connectWallet}
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
