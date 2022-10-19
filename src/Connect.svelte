<script lang="ts">
  import { get } from "svelte/store";
  import { Connection, state } from "@app/session";
  import type { Err } from "@app/error";
  import ErrorModal from "@app/ErrorModal.svelte";
  import type { Wallet } from "@app/wallet";
  import ConnectWallet from "@app/components/Modal/ConnectWallet.svelte";
  import Button from "@app/Button.svelte";

  export let caption = "Connect";
  export let wallet: Wallet;
  export let buttonVariant: "foreground" | "primary";

  let error: Err | null = null;

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
    } catch (e: any) {
      walletConnectState.set({ state: "close" });
      error = e;
    }
  };

  $: connecting = $state.connection === Connection.Connecting;
  $: walletConnectState = wallet.walletConnect.state;
</script>

<Button
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

{#if $walletConnectState.state === "open"}
  <ConnectWallet
    {wallet}
    uri={$walletConnectState.uri}
    on:close={onModalClose} />
{:else if error}
  <ErrorModal
    floating
    emoji="👛"
    title="Connection failed"
    {error}
    on:close={() => (error = null)} />
{/if}
