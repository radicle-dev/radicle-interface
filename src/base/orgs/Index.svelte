<script lang="typescript">
  import type { SvelteComponent } from 'svelte';
  import { session } from '@app/session';
  import Create from '@app/base/orgs/Create.svelte';
  import type { Config } from '@app/config';

  export let config: Config;

  let modal: typeof SvelteComponent | null = null;

  $: owner = $session && $session.address;
</script>

<style>
</style>

<main>
  <button on:click={() => modal = Create} disabled={!owner} class="secondary">
    Create an Org
  </button>
</main>

<svelte:component this={modal} {owner} {config} on:close={() => modal = null} />
