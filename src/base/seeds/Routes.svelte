<script lang="ts">
  import type { Config } from "@app/config";
  import type { Session } from "@app/session";

  import View from "@app/base/seeds/View.svelte";
  import { Route } from "svelte-routing";

  export let config: Config;
  export let session: Session | null;
</script>

<Route path="/seeds/radicle.local">
  <View {config} {session} host={"0.0.0.0"} />
</Route>

<Route path="/seeds/:seed" let:params>
  <View {config} {session} host={params.seed} />
</Route>
