<script lang="ts">
  import { Route } from "svelte-routing";
  import View from "@app/base/seeds/View.svelte";
  import type { Wallet } from "@app/wallet";
  import type { Session } from "@app/session";

  export let wallet: Wallet;
  export let session: Session | null;
</script>

<Route path="/seeds/radicle.local">
  <View {wallet} {session} hostAndPort={"0.0.0.0"} />
</Route>

<Route path="/seeds/:seed" let:params>
  <View {wallet} {session} hostAndPort={params.seed} />
</Route>
