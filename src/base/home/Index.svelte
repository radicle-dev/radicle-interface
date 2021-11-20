<script lang="ts">
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { Profile } from '@app/profile';
  import { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';
  import Message from '@app/Message.svelte';
  import Cards from '@app/Cards.svelte';

  export let config: Config;

  const getOrgs = config.orgs.pinned.length > 0
    ? Org.getMulti(config.orgs.pinned, config)
    : Org.getAll(config);

  const getUsers = config.users.pinned.length > 0
    ? Profile.getMulti(config.users.pinned, config)
    : Promise.resolve([]);

  const getEntities = Promise.all([getUsers, getOrgs]).then(([users, orgs]) => {
    return { users, orgs };
  });

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
  .loading {
    padding-top: 2rem;
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

  {#await getEntities}
    <div class="loading">
      <Loading center />
    </div>
  {:then entities}
    {#if entities.orgs.length || entities.users.length}
      <div class="heading">
        Explore <strong>orgs</strong> and <strong>users</strong> on the Radicle network.
      </div>
      <Cards {config} profiles={entities.users} orgs={entities.orgs}>
        <div class="empty">There are no orgs or users.</div>
      </Cards>
      <div class="actions">
        <button class="small secondary" on:click={viewMore}>
          View all
        </button>
      </div>
    {/if}
  {:catch}
    <div class="padding">
      <Message error>
        <strong>Error: </strong> failed to load orgs and users.
      </Message>
    </div>
  {/await}
</main>
