<script lang="ts">
  import { Connection } from "@app/session";
  import { state } from "@app/session";
  import type { Config } from "@app/config";
  import Modal from "@app/Modal.svelte";
  export let config: Config;
  export let caption = "Connect";
  export let className = "";
  export let style = "";

  let walletUnavailable = !window.ethereum;

  let isModalOpen = false;

  const onClickConnect = () => {
    isModalOpen = !isModalOpen;
    // state.connect(config);
  };

  $: connecting = $state.connection === Connection.Connecting;
</script>

{#if isModalOpen}
  <Modal on:close floating={isModalOpen}>
    <p slot="body">Wallet connect modal stays here</p>
  </Modal>
{/if}

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
