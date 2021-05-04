<script lang="typescript">
  import type { SvelteComponent } from 'svelte';
  import { session } from '@app/session';
  import CreateOrg from '@app/base/orgs/CreateOrg.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

  let modal: typeof SvelteComponent | null = null;

  $: owner = $session && $session.address;
</script>

<style>
</style>

<main>
  <button on:click={() => modal = CreateOrg} disabled={!owner} class="secondary">
    Create an Org
  </button>
</main>

<svelte:component this={modal} {owner} {config} on:close={() => modal = null} />
