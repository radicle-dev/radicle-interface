<script lang="ts">
  import Avatar from "@app/Avatar.svelte";
  import type { Seed } from "@app/base/seeds/Seed";
  import type { Wallet } from "@app/wallet";
  import { signInWithEthereum } from "@app/siwe";
  import Loading from "@app/Loading.svelte";
  import { Connection } from "@app/session";
  import Button from "@app/Button.svelte";

  export let seed: Seed;
  export let wallet: Wallet;
  export let caption = "Sign in";
  export let tooltip = "";
  export let disabled = false;
  export let address: string | null = null;

  let connection: Connection = Connection.Disconnected;
</script>

<style>
  .align {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
</style>

<Button
  variant="secondary"
  size="small"
  title={tooltip}
  disabled={disabled || connection === Connection.Connecting}
  on:click={async () => {
    connection = Connection.Connecting;
    try {
      await signInWithEthereum(seed, wallet);
    } catch (e) {
      console.error("Sign in", e);
      connection = Connection.Disconnected;
    }
  }}>
  <span class="align">
    {#if address}
      <Avatar title={address} source={address} inline />
    {/if}
    {#if connection === Connection.Connecting}
      <Loading small />
    {:else}
      {caption}
    {/if}
  </span>
</Button>
