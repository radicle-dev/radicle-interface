<script lang="ts">
  import { Connection } from "@app/session";
  import { state } from '@app/session';
  import type { Config } from '@app/config';

  export let config: Config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  const onClickConnect = () => {
    state.connectWalletConnect(config);
  }

  $: connecting = $state.connection === Connection.Connecting;
</script>

<style>
</style>

<button
  on:click={onClickConnect}
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
