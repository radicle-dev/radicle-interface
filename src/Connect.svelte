<script lang="javascript">
  import { derived } from "svelte/store";
  import { CONNECTION, session, connectWallet } from "./session.js";

  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  const connecting = derived(session, $s => {
    return $s.connection === CONNECTION.CONNECTING;
  });
</script>

<style>
</style>

<button
  on:click={connectWallet}
  {style}
  class="connect {className}"
  disabled={$connecting || walletUnavailable}
  data-waiting={$connecting || null}
>
  {#if $connecting}
    Connecting...
  {:else}
    {caption}
  {/if}
</button>
