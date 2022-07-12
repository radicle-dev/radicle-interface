<script lang="ts">
  import type { Config } from '@app/config';
  import { Profile } from '@app/profile';
  import { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';
  import Message from '@app/Message.svelte';
  import Cards from '@app/Cards.svelte';
  import { setOpenGraphMetaTag } from '@app/utils';
  import { Seed } from '@app/base/seeds/Seed';

  export let config: Config;

  setOpenGraphMetaTag([
    { prop: "og:title", content: "Radicle Interface" },
    { prop: "og:description", content: "Interact with Radicle" },
    { prop: "og:url", content: window.location.href }
  ]);

  const getOrgs = config.orgs.pinned.length > 0
    ? Org.getMulti(config.orgs.pinned, config)
    : Org.getAll(config);

  const getUsers = config.users.pinned.length > 0
    ? Profile.getMulti(config.users.pinned, config)
    : Promise.resolve([]);

  const getSeeds = Object.keys(config.seeds.pinned).length > 0
    ? Seed.lookupMulti(Object.keys(config.seeds.pinned), config)
    : Promise.resolve([]);

  const getEntities = Promise.all([getUsers, getOrgs, getSeeds]).then(([users, orgs, seeds]) => {
    return { users, orgs, seeds };
  });
</script>

<style>
  main {
    padding: 3rem 3rem;
    width: 100%;
    max-width: 74rem;
  }
  .blurb {
    color: var(--color-foreground-90);
    padding: 0rem;
    max-width: 70%;
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
  @media (max-width: 720px) {
    .blurb {
      max-width: none;
      font-size: 1rem;
    }
    .heading {
      font-size: 1rem;
    }
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main>
  <div class="blurb">
    <p>Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software over a
    peer-to-peer network 🌐 built on Git.</p>
  </div>

  {#await getEntities}
    <div class="loading">
      <Loading center />
    </div>
  {:then entities}
    {#if entities.seeds.length}
      <div class="heading">
        Explore <strong>seed nodes</strong> on the Radicle network.
      </div>
      <Cards {config} seeds={entities.seeds}>
        <div class="empty">There are no seed nodes.</div>
      </Cards>
    {/if}
    {#if entities.orgs.length || entities.users.length}
      <div class="heading">
        Explore <strong>orgs</strong> and <strong>users</strong> on the Radicle network.
      </div>
      <Cards {config} profiles={entities.users} orgs={entities.orgs}>
        <div class="empty">There are no orgs or users.</div>
      </Cards>
    {/if}
  {:catch}
    <div class="padding">
      <Message error>
        <strong>Error: </strong> failed to load orgs and users.
      </Message>
    </div>
  {/await}
</main>
