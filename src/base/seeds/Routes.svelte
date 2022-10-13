<script lang="ts" context="module">
  export type Params = { host: string };
</script>

<script lang="ts">
  import View from "@app/base/seeds/View.svelte";
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";

  export let config: Config;
  export let session: Session | null;
  export let params: Params;
</script>

{#if params.host === "radicle.local"}
  <View {config} {session} host={"0.0.0.0"} />
{:else}
  <View {config} {session} host={params.host} />
{/if}
