<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";

  import { get } from "svelte/store";

  import * as modal from "@app/lib/modal";
  import Button from "@app/components/Button.svelte";
  import ConnectWalletModal from "@app/components/Connect/ConnectWalletModal.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  import { Connection, state } from "@app/lib/session";

  export let caption = "Connect";
  export let wallet: Wallet;
  export let buttonVariant: "foreground" | "primary";
  export let autofocus: boolean = false;

  const onModalClose = () => {
    const wcs = get(wallet.walletConnect.state);

    if (wcs.state === "open") {
      wallet.walletConnect.state.set({ state: "close" });
      wcs.onClose();
    }
  };

  const onConnect = async () => {
    try {
      await state.connectWalletConnect(wallet);
    } catch (error: any) {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Connection failed",
          error: error.message,
        },
      });
    }
  };
  const modalStore = modal.modalStore;

  $: connecting = $state.connection === Connection.Connecting;
  $: walletConnectState = wallet.walletConnect.state;
  $: if ($walletConnectState.state === "open") {
    modal.show({
      component: ConnectWalletModal,
      props: {
        wallet,
        uri: $walletConnectState.uri,
        onClose: () => {
          onModalClose();
          modal.hide();
        },
      },
      hideCallback: onModalClose,
    });
  } else {
    if ($modalStore?.component === ConnectWalletModal) {
      modal.hide();
    }
  }
</script>

<Button
  {autofocus}
  on:click={onConnect}
  variant={buttonVariant}
  disabled={connecting}
  waiting={connecting}>
  {#if connecting}
    Connecting…
  {:else}
    {caption}
  {/if}
</Button>
