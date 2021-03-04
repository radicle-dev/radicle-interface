<script lang="js">
  import {CONNECTION, session, connectWallet} from "./session.js";
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let connecting = false;
  let walletUnavailable = !window.ethereum;

  session.subscribe((sess) => {
    connecting = sess.connection === CONNECTION.CONNECTING;
  });
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
