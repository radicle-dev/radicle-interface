<script lang="typescript">
  import type { SvelteComponent } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { session } from '@app/session';
  import Create from '@app/base/orgs/Create.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

  let modal: typeof SvelteComponent = Create;

  $: owner = $session && $session.address;
</script>

<svelte:component this={modal} {owner} {config} on:close={() => navigate('/')} />
