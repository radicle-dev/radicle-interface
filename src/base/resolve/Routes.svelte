<script lang="typescript">
  import { Route } from "svelte-routing";
  import Resolve from '@app/base/resolve/Resolve.svelte';
  import type { Config } from '@app/config';
  import * as utils from '@app/utils';

  export let config: Config;
</script>

<Route path="/resolve" let:location>
  <Resolve {config} query={utils.getSearchParam("q", location)} />
</Route>
