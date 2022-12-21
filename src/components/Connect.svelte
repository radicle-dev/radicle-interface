<script lang="ts">
  import type { Err } from "@app/lib/error";
  import type { Wallet } from "@app/lib/wallet";

  import { get } from "svelte/store";

  import Button from "@app/components/Button.svelte";
  import ConnectWallet from "@app/components/Connect/ConnectWallet.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  import { Connection, state } from "@app/lib/session";

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
