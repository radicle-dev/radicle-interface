<script lang="typescript">
    import { qrcode } from "pure-svg-code";
    import Modal from "@app/Modal.svelte";
    export let uri: string;
    console.log(uri)
    $: svgString = qrcode({
      content: uri,
      width: 225,
      height: 225,
      color: "black",
      background: "white",
      ecl: "M",
    });
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
    align-items: center;
    flex-direction: column;
    height: 100%;
  }
  </style>
  
  <div class="wrapper">
  <Modal floating={true}>
    <p slot="title">Connect your wallet</p>
    <p slot="subtitile" style="text-align: center;">
      Scan this code with your wallet. Not working? <br />
      <a href="https://walletconnect.org/wallets" class="typo-link">
        View compatible wallets.
      </a>
    </p>
  
    <div slot="body" class="qrcode-wrapper">
      <div data-cy="qr-code">
        {@html svgString}
      </div>
    <div>

    </div>
    </div>
  </Modal>
  </div>
  
 