<script lang="ts">
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';
  import Message from '@app/Message.svelte';

  import List from '@app/base/orgs/List.svelte';

  export let config: Config;

  const getOrgs = config.orgs.pinned.length > 0
    ? Org.getMulti(config.orgs.pinned, config)
    : Org.getAll(config);

  const viewMore = () => {
    navigate("/orgs");
  };
</script>

<style>
  main {
    padding: 3rem 3rem;
    width: 100%;
    max-width: 72rem;
  }
  .blurb {
    color: var(--color-foreground-90);
    padding: 0rem;
    max-width: 90%;
    font-size: 1.25rem;
    text-align: left;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
  }
  .heading {
    color: var(--color-secondary);
    padding: 1rem 0rem;
    font-size: 1.25rem;
  }
  .actions {
    margin-top: 1rem;
    text-align: center;
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main>
  <div class="blurb">
    <p>Radicle 🌱 is a Web3 network for software collaboration. Radicle
    provides truly 👌 decentralized infrastructure for developer communities 🧙,
    enabling anyone to fund 💸 and manage software using NFTs 🍬 and multi-sigs 🖊️.
    </p>
  </div>

  {#await getOrgs}
    <div class="loading">
      <Loading center />
    </div>
  {:then orgs}
    <div class="heading">
      Explore <strong>orgs</strong> and <strong>projects</strong> on the Radicle network.
    </div>
    <List {config} {orgs}>
      <div class="orgs-empty">There are no orgs.</div>
    </List>
    <div class="actions">
      <button class="small secondary" on:click={viewMore}>
        View all
      </button>
    </div>
  {:catch}
    <div class="padding">
      <Message error>
        <strong>Error: </strong> failed to load orgs.
      </Message>
    </div>
  {/await}
</main>
