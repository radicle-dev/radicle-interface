<script lang="typescript">
    import { qrcode } from "pure-svg-code";
    import Modal from "@app/Modal.svelte";
    import Metamask from "@app/Metamask.svelte";
    import { state } from '@app/session';
    import type { Config } from '@app/config';
    

    export let uri: string;
    export let config: Config;
    export let caption = "Connect Wallet";


    $: svgString = qrcode({
      content: uri,
      width: 225,
      height: 225,
      color: "black",
      background: "white",
      ecl: "M"
    });

    const onClickConnect = () => {

      console.log(config, "from svelete");
    
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
    <button on:click={onClickConnect} style="background-color: white; border-radius: 1rem; height:20;">
      <div style="display: flex; align-items: center; justify-content: center;">
     
      <Metamask/> <p style="margin-left: 0.5rem; color: var(--color-secondary); font-weight: bold;">{caption}</p>
    
    
    </div>
    </button>
    </div>
  </Modal>
  </div>
  
 