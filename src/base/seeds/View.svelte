<script lang="ts">
  import type { Config } from "@app/config";
  import { Seed } from "@app/base/seeds/Seed";
  import Loading from "@app/Loading.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Projects from "@app/base/orgs/View/Projects.svelte";

  export let config: Config;
  export let host: string;

</script>

<style>
  main {
    padding: 5rem 0;
    width: 720px;
  }
  main > header {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 2rem;
  }
  main > header > * {
    margin: 0 1rem 0 0;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
  }
  .fields {
    display: grid;
    grid-template-columns: 5rem 4fr 2fr;
    grid-gap: 1rem 2rem;
    margin-bottom: 2rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
    height: 2rem;
    line-height: 2rem;
  }
  .title {
    display: flex;
    align-items: center;
  }
  .desktop {
    display: block !important;
  }
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .fields {
      grid-template-columns: 5rem auto;
    }
    .desktop {
      display: none !important;
    }
  }
</style>

<svelte:head>
  <title>{host}</title>
</svelte:head>

{#await Seed.lookup(host, config)}
  <main class="off-centered">
    <Loading center />
  </main>
{:then seed}
  <main>
    <header>
      <div class="info">
        <span class="title">
          <span class="bold">
            {host} 🌱
          </span>
        </span>
      </div>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="label">Address</div>
      <SeedAddress {seed} port={seed.link.port} />
      <!-- Seed ID -->
      <div class="label">Seed ID</div>
      <div>{seed.id}</div>
      <div class="desktop" />
      <!-- API Port -->
      <div class="label">API Port</div>
      <div>{seed.api.port}</div>
      <div class="desktop" />
      <!-- API Version -->
      <div class="label">Version</div>
      <div>{seed.version}</div>
      <div class="desktop" />
    </div>
    <!-- Seed Projects -->
    <Projects {seed} {config} />
  </main>
{:catch}
  <NotFound title={host} subtitle="Not able to query information from this seed." />
{/await}
