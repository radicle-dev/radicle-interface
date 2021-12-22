<script lang="ts">
  import type { Config } from "@app/config";
  import { Seed } from "@app/base/seeds/Seed";
  import Widget from "@app/base/projects/Widget.svelte";
  import Loading from "@app/Loading.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import Modal from "@app/Modal.svelte";

  export let config: Config;
  export let seedAddress: string;

  const back = () => window.history.back();

  config = config.withSeed({ host: seedAddress });
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
  .projects {
    margin-top: 2rem;
  }
  .projects .project {
    margin-bottom: 1rem;
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
  <title>{seedAddress}</title>
</svelte:head>

{#await Seed.get(config)}
  <main class="off-centered">
    <Loading center />
  </main>
{:then info}
  <main>
    <header>
      <div class="info">
        <span class="title">
          <span class="bold">
            🌱 {seedAddress}
          </span>
        </span>
      </div>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="label">Address</div>
      {#if info.version === "0.2.0" && info.host}
        <SeedAddress id={info.id} host={info.host} port={config.seed.link.port} />
      {:else}
        <div class="seed-address subtle">N/A</div>
        <div class="desktop" />
      {/if}
      <!-- Seed ID -->
      <div class="label">Seed ID</div>
      <div>{info.id}</div>
      <div class="desktop" />
      <!-- API Port -->
      <div class="label">API Port</div>
      <div>{config.seed.api.port}</div>
      <div class="desktop" />
      <!-- API Version -->
      <div class="label">Version</div>
      <div>{info.version}</div>
      <div class="desktop" />
    </div>
    <!-- Seed Projects -->
    {#if info.version === "0.2.0"}
      {#await Seed.getProjects(config) then projects}
        <div class="projects">
          {#each projects as project}
            <div class="project">
              <Widget {project} {config} seed={seedAddress} />
            </div>
          {/each}
        </div>
      {/await}
    {:else}
      <div class="projects subtle">For seed project listing, update http-api to v0.2.0</div>
    {/if}
  </main>
{:catch}
  <Modal subtle>
    <span slot="title">🏜️</span>
    <span slot="body">
      <p class="highlight"><strong>{seedAddress}</strong></p>
      <p>Not able to query information from this seed.</p>
    </span>
    <span slot="actions">
      <button on:click={back}>
        Back
      </button>
    </span>
  </Modal>
{/await}
