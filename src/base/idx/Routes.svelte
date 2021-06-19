<script lang="ts">
  import { Route } from "svelte-routing";
  import Link from '@app/base/idx/Link.svelte';
  import type { Config } from '@app/config';

  export let config: Config;
</script>

<Route path="/idx/:did/link/:caip10" let:params>
  <Link {config} did={params.did} caip10={params.caip10} />
</Route>
