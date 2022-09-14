<script lang="ts">
  import { get } from "svelte/store";
  import { Connection, state } from "@app/session";
  import type { Err } from "@app/error";
  import Error from "@app/Error.svelte";
  import type { Config } from "@app/config";
  import ConnectWallet from "@app/components/Modal/ConnectWallet.svelte";
  import Button from "@app/Button.svelte";

  export let caption = "Connect";
  export let config: Config;
  export let buttonVariant: "foreground" | "primary";

  let error: Err | null = null;

  const onModalClose = () => {
    const wcs = get(config.walletConnect.state);

    if (wcs.state === "open") {
      config.walletConnect.state.set({ state: "close" });
      wcs.onClose();
    }
  };
  const onConnect = async () => {
    try {
      await state.connectWalletConnect(config);
    } catch (e: any) {
      walletConnectState.set({ state: "close" });
      error = e;
    }
  };

  $: connecting = $state.connection === Connection.Connecting;
  $: walletConnectState = config.walletConnect.state;
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
    {config}
    uri={$walletConnectState.uri}
    on:close={onModalClose} />
{:else if error}
  <Error
    floating
    emoji="👛"
    title="Connection failed"
    {error}
    on:close={() => (error = null)} />
{/if}
