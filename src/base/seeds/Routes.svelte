<script lang="ts">
  import View from "@app/base/seeds/View.svelte";
  import type { Wallet } from "@app/wallet";
  import type { Session } from "@app/session";

  export let wallet: Wallet;
  export let session: Session | null;
  export let host: string;
</script>

{#if host === "radicle.local"}
  <View {wallet} {session} host={"0.0.0.0"} />
{:else}
  <View {wallet} {session} {host} />
{/if}
