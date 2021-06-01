<script lang="typescript">
  import type { SvelteComponent } from 'svelte';
  import { session } from '@app/session';
  import Create from '@app/base/orgs/Create.svelte';
  import { Org } from '@app/base/orgs/Org';
  import type { Config } from '@app/config';
  import Error from '@app/Error.svelte';
  import Blockies from '@app/Blockies.svelte';
  import Loading from '@app/Loading.svelte';

  export let config: Config;

  const onCreate = () => modal = Create;

  let modal: typeof SvelteComponent | null = null;

  $: account = $session && $session.address;
</script>

<style>
  main {
    width: 100%;
    padding: 0 3rem;
    display: block;
    align-items: space-between;
    justify-content: space-between;
  }
  main header {
    color: var(--color-secondary);
    padding: 0 3rem 3rem 3rem;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
  }

  button.create {
    margin-left: 1.5rem;
  }

  .org {
    width: 3rem;
    height: 3rem;
    margin: 3rem;
    display: inline-block;
  }
</style>

<main>
  {#await Org.getAll(config)}
    <Loading center />
  {:then orgs}
    <header>
      <span><strong>Orgs</strong> on the Radicle network.</span>
      <button class="create small secondary" on:click={onCreate} disabled={!account}>
        Create
      </button>
    </header>
    {#each orgs as org}
      <div class="org"><Blockies address={org.address} /></div>
    {/each}
  {/await}
</main>

<svelte:component this={modal} owner={account} {config} on:close={() => modal = null} />
