<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";

  import { qrcode } from "pure-svg-code";

  import Modal from "@app/components/Modal.svelte";
  import { state } from "@app/lib/session";

  export let uri: string;
  export let wallet: Wallet;
  export let onClose: () => void;

  $: svgString = qrcode({
    content: uri,
    width: 200,
    height: 200,
    color: "black",
    padding: 0,
    background: "white",
    ecl: "M",
  });
</script>

<style>
  .qrcode-wrapper {
    width: min-content;
    margin: 0 auto;
    padding: 0.75rem;
    background-color: white;
    border-radius: var(--border-radius-small);
  }
  .qrcode {
    width: 200px;
    height: 200px;
  }
</style>

<Modal
  emoji="👛"
  title="Connect your wallet"
  primaryAction={{
    name: "Connect with Metamask",
    callback: () => {
      state.connectMetamask(wallet);
    },
    props: {
      variant: "secondary",
      size: "small",
      disabled: !wallet.metamask.signer,
    },
  }}
  closeAction={{
    callback: onClose,
    props: { size: "small" },
  }}>
  <div slot="subtitle">
    <div class="txt-small">
      Scan the QR code with <span class="txt-bold">WalletConnect</span>
      or use
      <span class="txt-bold">Metamask</span>
      .
    </div>
  </div>

  <div slot="body" style:margin="1rem auto">
    <div class="qrcode-wrapper">
      <div class="qrcode">
        {@html svgString}
      </div>
    </div>
  </div>
</Modal>
