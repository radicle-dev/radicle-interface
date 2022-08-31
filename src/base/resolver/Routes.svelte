<script lang="ts">
  import { Route } from "svelte-routing";
  import Resolve from "@app/base/resolver/Query.svelte";
  import type { Config } from "@app/config";
  import * as utils from "@app/utils";

  export let config: Config;
</script>

<Route path="/resolver/query" let:location>
  <Resolve {config} query={utils.getSearchParam("q", location)} />
</Route>
