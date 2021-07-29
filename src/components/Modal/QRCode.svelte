<script lang="ts">
  import { qrcode } from "pure-svg-code";
  import Modal from "@app/Modal.svelte";
  import { state } from "@app/session";
  import type { Config } from "@app/config";

  export let uri: string;
  export let config: Config;

  $: svgString = qrcode({
    content: uri,
    width: 225,
    height: 225,
    color: "black",
    background: "white",
    ecl: "M",
  });

  const onClickConnect = () => {
    state.connectMetamask(config);
  };
</script>

<style>
  .qrcode-wrapper {
    width: fit-content;
    margin: var(--content-padding) auto;
    padding: calc(var(--content-padding) / 2);
    border-radius: 1rem;
    background-color: white;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<div class="wrapper">
  <Modal floating={true} center>
    <p slot="title">Connect your wallet</p>
    <p slot="subtitle" style="text-align: center;">
      Code Not working? <br />
      <a href="https://walletconnect.org/wallets" class="link">
        View compatible wallets.
      </a>
    </p>
    <div slot="body">
      <div class="qrcode-wrapper">
        <div data-cy="qr-code">
          {@html svgString}
        </div>
      </div>
      <p>Or Connect your metamask wallet</p>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a on:click={onClickConnect} class="link"> Connect with Metamask </a>
    </div>
  </Modal>
</div>
