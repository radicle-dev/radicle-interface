<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { qrcode } from "pure-svg-code";

  import Modal from "@app/Modal.svelte";
  import { state } from "@app/session";
  import type { Config } from "@app/config";

  export let uri: string;
  export let config: Config;

  $: svgString = qrcode({
    content: uri,
    width: 200,
    height: 200,
    color: "black",
    padding: 0,
    background: "white",
    ecl: "M",
  });

  const dispatch = createEventDispatcher();
  const onClickConnect = () => { state.connectMetamask(config); };
  const onClose = () => { dispatch("close"); };
</script>

<style>
  .qrcode-wrapper {
    width: min-content;
    margin: 0 auto;
    padding: 0.75rem;
    background-color: white;
  }
  .qrcode {
    width: 200px;
    height: 200px;
  }
  .wrapper {
    cursor: default;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<div class="wrapper">
  <Modal floating center>
    <div slot="title">
      <div>👛</div>
      <div>Connect your wallet</div>
    </div>

    <div slot="subtitle">
      <div class="text-small">
        WalletConnect<br/>
        <a href="https://walletconnect.org/wallets" class="link">
          View compatible wallets
        </a>
      </div>
    </div>

    <div slot="body">
      <div class="qrcode-wrapper">
        <div class="qrcode">
          {@html svgString}
        </div>
      </div>
    </div>

    <div slot="actions">
      <button class="secondary tiny text-small" on:click={onClickConnect} disabled={!config.metamaskSigner}>
        Connect with Metamask
      </button>
      <button class="text tiny text-small" on:click={onClose}>
        Close
      </button>
    </div>
  </Modal>
</div>
