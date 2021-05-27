<script lang="typescript">
  import type { SvelteComponent } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { session } from '@app/session';
  import Create from '@app/base/orgs/Create.svelte';
  import type { Config } from '@app/config';
  import Error from '@app/Error.svelte';

  export let config: Config;

  let modal: typeof SvelteComponent = Create;
  let owner: string | null = $session && $session.address;
</script>

{#if owner}
  <svelte:component this={modal} {owner} {config} on:close={() => window.history.back()} />
{:else}
  <Error on:close={() => window.history.back()}>
    Not connected.
  </Error>
{/if}
