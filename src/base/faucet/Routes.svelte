<script lang="ts">
  import { Route } from "tinro";
  import Index from "@app/base/faucet/Index.svelte";
  import type { Config } from "@app/config";
  import Withdraw from "./Withdraw.svelte";

  export let config: Config;
</script>

<Route path="/">
  <Index {config} />
</Route>

<Route path="/withdraw">
  <Withdraw {config} />
</Route>
