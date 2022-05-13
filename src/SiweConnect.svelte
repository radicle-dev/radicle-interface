<script lang="ts">
  import type { Seed } from "@app/base/seeds/Seed";
  import type { Config } from "@app/config";
  import { signInWithEthereum } from "@app/siwe";
  import Loading from "@app/Loading.svelte";
  import { Connection } from "@app/session";

  export let seed: Seed;
  export let config: Config;
  export let caption = "Sign in";
  export let tooltip = "";
  export let disabled = false;

  let connection: Connection = Connection.Disconnected;
</script>

<style>
  button {
    min-height: 32px;
  }
</style>

<button
  class="tiny secondary"
  title={tooltip}
  disabled={disabled || (connection === Connection.Connecting)}
  on:click={async () => {
    connection = Connection.Connecting;
    try {
      await signInWithEthereum(seed, config);
    } catch (e) {
      console.error("Sign in", e);
      connection = Connection.Disconnected;
    }
  }}
>
  {#if connection === Connection.Connecting}
    <Loading small />
  {:else}
    {caption}
  {/if}
</button>
