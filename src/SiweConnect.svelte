<script lang="ts">
  import type { Seed } from "@app/base/seeds/Seed";
  import type { Config } from "@app/config";

  import Avatar from "@app/Avatar.svelte";
  import Button from "@app/Button.svelte";
  import Loading from "@app/Loading.svelte";
  import { Connection } from "@app/session";
  import { signInWithEthereum } from "@app/siwe";

  export let address: string | null = null;
  export let caption = "Sign in";
  export let config: Config;
  export let disabled = false;
  export let seed: Seed;
  export let tooltip = "";

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
      await signInWithEthereum(seed, config);
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
