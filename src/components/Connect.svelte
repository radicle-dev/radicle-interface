<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import { state } from "@app/lib/session";

  export let caption = "Connect";
  export let buttonVariant: "foreground" | "primary";

  $: connecting = $state?.connection === "connecting";
</script>

<Button
  on:click={() => {}}
  variant={buttonVariant}
  disabled={connecting}
  waiting={connecting}>
  {#if connecting}
    Connecting…
  {:else}
    {caption}
  {/if}
</Button>

<!-- {#if $walletConnectState.state === "open"}
  <ConnectWallet uri={$walletConnectState.uri} on:close={() => {}} />
{:else if error}
  <ErrorModal
    floating
    emoji="👛"
    title="Connection failed"
    {error}
    on:close={() => (error = null)} />
{/if} -->
