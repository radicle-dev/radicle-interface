<script lang="ts">
  import type { Config } from "@app/config";

  import Index from "@app/base/faucet/Index.svelte";
  import Withdraw from "./Withdraw.svelte";
  import { Route } from "svelte-routing";

  export let config: Config;
</script>

<Route path="faucet">
  <Index {config} />
</Route>

<Route path="faucet/withdraw">
  <Withdraw {config} />
</Route>
