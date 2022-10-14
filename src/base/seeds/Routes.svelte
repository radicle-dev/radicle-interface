<script lang="ts">
  import type { Config } from "@app/config";
  import type { SeedParams } from "@app/router/definitions";
  import type { Session } from "@app/session";

  import View from "@app/base/seeds/View.svelte";

  export let config: Config;
  export let session: Session | null;
  export let params: SeedParams;
</script>

{#if params.host === "radicle.local"}
  <View {config} {session} host={"0.0.0.0"} />
{:else}
  <View {config} {session} host={params.host} />
{/if}
