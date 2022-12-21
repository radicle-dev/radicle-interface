<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";

  import { createEventDispatcher } from "svelte";
  import { qrcode } from "pure-svg-code";

  import Button from "@app/components/Button.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { state } from "@app/lib/session";
  import { twemoji } from "@app/lib/utils";

  export let uri: string;
  export let wallet: Wallet;

  $: svgString = qrcode({
    content: uri,
    width: 200,
    height: 200,
    color: "black",
    padding: 0,
    background: "white",
    ecl: "M",
  });

  const dispatch = createEventDispatcher<{ close: never }>();
  const onClickConnect = () => {
    state.connectMetamask(wallet);
  };
  const onClose = () => {
    dispatch("close");
  };
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
  .actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }
</style>

<div class="wrapper">
  <Modal floating center>
    <div slot="title">
      <div use:twemoji>👛</div>
      <div>Connect your wallet</div>
    </div>

    <div slot="subtitle">
      <div class="txt-small">
        Scan the QR code with <span class="txt-bold">WalletConnect</span>
        or use
        <span class="txt-bold">Metamask</span>
        .
      </div>
    </div>

    <div slot="body">
      <div class="qrcode-wrapper">
        <div class="qrcode">
          {@html svgString}
        </div>
      </div>
    </div>

    <div class="actions" slot="actions">
      <Button
        variant="secondary"
        size="small"
        on:click={onClickConnect}
        disabled={!wallet.metamask.signer}>
        Connect with Metamask
      </Button>
      <Button variant="text" size="small" on:click={onClose}>Close</Button>
    </div>
  </Modal>
</div>
