<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from "@app/base/faucet/Index.svelte";
  import type { Config } from "@app/config";
  import Withdraw from "./Withdraw.svelte";

  export let config: Config;
</script>

<Route path="faucet">
  <Index {config} />
</Route>

<Route path="faucet/withdraw">
  <Withdraw {config} />
</Route>
