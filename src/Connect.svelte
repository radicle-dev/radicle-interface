<script lang="ts">
  import { Connection } from "@app/session";
  import { state } from "@app/session";
  import WCEthereumProvider from "@app/WalletConnectProvider";
  import type { Config } from "@app/config";
  import Modal from "@app/Modal.svelte";
  export let config: Config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  let isModalOpen = false;
  const TEST_PROVIDER_OPTS = {
    chainId: config.walletConnect.testChainId,
    qrcode: true,
    bridge:config.walletConnect.bridge,
    rpc: {
      [config.walletConnect.testChainId]: config.walletConnect.sessionRpcHost,
    },
  };


  const onClickConnect = async () => {
    isModalOpen = !isModalOpen;

    const provider = new WCEthereumProvider(TEST_PROVIDER_OPTS);

    const providerAccounts = await provider.enable();
    // state.connect(config);
    console.log(providerAccounts, "provider accounts");

  state.connect(config, providerAccounts[0])

 
  };

  $: connecting = $state.connection === Connection.Connecting;

  $: isModalOpen = !isModalOpen;
</script>

<!-- {#if isModalOpen}
  <Modal on:close floating={false}>
    <p slot="body">Wallet connect modal stays here</p>
  </Modal>
{/if} -->

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

<style>
</style>
