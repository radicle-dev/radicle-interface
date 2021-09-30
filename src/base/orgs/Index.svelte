<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { session } from '@app/session';
  import Create from '@app/base/orgs/Create.svelte';
  import { Org } from '@app/base/orgs/Org';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';
  import Message from '@app/Message.svelte';
  import List from './List.svelte';

  export let config: Config;
  export let pinned = false;

  const getOrgs = pinned && (config.orgs.pinned.length > 0)
    ? Org.getMulti(config.orgs.pinned, config)
    : Org.getAll(config);
  const onCreate = () => modal = Create;
  let modal: typeof SvelteComponent | null = null;

  $: account = $session && $session.address;
</script>

<style>
  main {
    width: 100%;
    padding: 5rem 3rem;
    display: block;
    align-items: space-between;
    justify-content: space-between;
  }
  main header {
    color: var(--color-secondary);
    font-size: 1.25rem;
    display: flex;
    align-items: center;
  }

  .padding {
    padding: 0 2rem 2rem 2rem;
  }

  .my-orgs {
    margin-bottom: 2rem;
  }
  .orgs-empty {
    margin-left: 2rem;
    padding: 1rem 0 2rem 0;
    font-style: italic;
    color: var(--color-foreground-faded);
  }

  button.create {
    margin-left: 1.5rem;
  }

  .loading {
    padding: 2rem 0;
  }
</style>

<svelte:head>
  <title>Radicle: Orgs</title>
</svelte:head>

<main>
  {#if account}
    <div class="my-orgs">
      <header class="padding">
        <span>My <strong>Orgs</strong></span>
        <button class="create small secondary" on:click={onCreate} disabled={!account}>
          Create
        </button>
      </header>

      {#await Org.getOrgsByMember(account, config)}
        <div class="loading">
          <Loading center />
        </div>
      {:then orgs}
        <List {config} {orgs}>
          <div class="orgs-empty">Orgs you are a member of show up here.</div>
        </List>
      {:catch}
        <div class="padding">
          <Message error>
            <strong>Error: </strong> failed to load orgs.
          </Message>
        </div>
      {/await}
    </div>
  {/if}

  <header class="padding">
    <span><strong>Orgs</strong> of the Radicle network</span>
  </header>

  {#await getOrgs}
    <div class="loading">
      <Loading center />
    </div>
  {:then orgs}
    <List {config} {orgs}>
      <div class="orgs-empty">There are no orgs.</div>
    </List>
  {:catch}
    <div class="padding">
      <Message error>
        <strong>Error: </strong> failed to load orgs.
      </Message>
    </div>
  {/await}
</main>

<svelte:component this={modal} owner={account} {config} on:close={() => modal = null} />
