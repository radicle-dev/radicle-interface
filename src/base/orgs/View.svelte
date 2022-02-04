<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as utils from '@app/utils';
  import Loading from '@app/Loading.svelte';

  export let addressOrName: string;
  export let config: Config;

  onMount(() => {
    navigate(`/${addressOrName}`);
  });
</script>
  
<svelte:head>
  <title>{utils.formatOrg(addressOrName, config)}</title>
</svelte:head>

<Loading center />
