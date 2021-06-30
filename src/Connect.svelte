<script lang="ts">
  import { Connection } from "@app/session";
  import { state } from "@app/session";
  import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

  import WCEthereumProvider from "@app/WalletConnectProvider";
  import type { Config } from "@app/config";
  import Modal from "@app/Modal.svelte";
  export let config: Config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  let isModalOpen = false;
  console.log();
  // const TEST_SESSION_CHAIN_ID = 3;

  // const TEST_SESSION_RPC_HOST =
  //   "https://rinkeby.infura.io/v3/e9c4665d91a343e295308d5995ff5a72";

    // Create a connector
const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
  qrcodeModal: QRCodeModal,
});
  // const TEST_PROVIDER_OPTS = {
  //   chainId: TEST_SESSION_CHAIN_ID,
  //   qrcode: true,
  //   bridge: "https://staging.walletconnect.org",
  //   rpc: {
  //     [TEST_SESSION_CHAIN_ID]: TEST_SESSION_RPC_HOST,
  //   },
  // };


  const onClickConnect = async () => {
    //isModalOpen = !isModalOpen;

    // const provider = new WCEthereumProvider(TEST_PROVIDER_OPTS);

    // const providerAccounts = await provider.enable();
    // // state.connect(config);
    // console.log(providerAccounts, "provider accounts");

    // Check if connection is already established
if (!connector.connected) {
  
  // create new session
  connector.createSession();
}

// Subscribe to connection events
connector.on("connect", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get provided accounts and chainId
  const { accounts, chainId } = payload.params[0];

  state.connect(config, accounts[0])

 
});
  };

  $: connecting = $state.connection === Connection.Connecting;
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
