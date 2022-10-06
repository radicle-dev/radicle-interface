<script lang="ts">
  import type { Config } from "@app/config";
  import type { Err } from "@app/error";

  import { get } from "svelte/store";

  import Button from "@app/Button.svelte";
  import ConnectWallet from "@app/components/Modal/ConnectWallet.svelte";
  import Error from "@app/Error.svelte";
  import { Connection, state } from "@app/session";

  export let buttonVariant: "foreground" | "primary";
  export let caption = "Connect";
  export let config: Config;

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
