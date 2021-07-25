<script lang="ts">
  import { Connection, state, store, ModalStateType } from "@app/session";
  import type { Config } from '@app/config';
  import ModalWalletQRCode from "@app/components/Modal/QRCode.svelte";

  export let config: Config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  const onClickConnect = () => {
    state.connectWalletConnect(config);
  };
  $: modalConnected = $store.status === ModalStateType.Open;
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
{#if modalConnected}
<ModalWalletQRCode {config} uri={$store.modalProps?.uri || ''} />
{/if}
  {#if connecting}
    Connecting...
  {:else}
    {caption}
  {/if}
</button>
