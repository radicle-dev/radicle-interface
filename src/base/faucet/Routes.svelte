<script lang="ts">
  import { Route } from "svelte-routing";
  import Index from "@app/base/faucet/Index.svelte";
  import type { Wallet } from "@app/wallet";
  import Withdraw from "./Withdraw.svelte";

  export let wallet: Wallet;
</script>

<Route path="faucet">
  <Index {wallet} />
</Route>

<Route path="faucet/withdraw">
  <Withdraw {wallet} />
</Route>
