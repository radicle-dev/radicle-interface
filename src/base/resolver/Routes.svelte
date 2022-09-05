<script lang="ts">
  import { Route } from "tinro";
  import Resolve from "@app/base/resolver/Query.svelte";
  import type { Config } from "@app/config";
  import * as utils from "@app/utils";

  export let config: Config;
</script>

<Route path="/resolver/query" let:meta>
  <Resolve {config} query={utils.getSearchParam("q", meta.query)} />
</Route>
