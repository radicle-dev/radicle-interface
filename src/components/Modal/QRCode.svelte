<script lang="typescript">
    import { qrcode } from "pure-svg-code";
    import Modal from "@app/Modal.svelte";
    export let uri: string;

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
  </style>
  
  
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
     
    </div>
  </Modal>
  
 