<script lang="ts">
  import type { Config } from '@app/config';
  import Orgs from '@app/base/orgs/Index.svelte';

  export let config: Config;
</script>

<style>
  main {
    width: 100%;
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main>
  <div>
    <Orgs {config} />
  </div>
</main>
