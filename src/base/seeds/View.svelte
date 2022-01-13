<script lang="ts">
  import type { Config } from "@app/config";
  import { Seed } from "@app/base/seeds/Seed";
  import Widget from "@app/base/projects/Widget.svelte";
  import * as utils from "@app/utils";
  import Loading from "@app/Loading.svelte";

  export let config: Config;
  export let seedAddress: string;

  const seed = new Seed(config, seedAddress);

  let seedCopied = false;
  const copySeed = (seedId: string, seedHost: string) => {
    return () => utils.toClipboard(utils.formatSeedAddress(seedId, seedHost, config)).then(() => {
      seedCopied = true;
      setTimeout(() => {
        seedCopied = false;
      }, 3000);
    });
  };
</script>

<style>
  main {
    padding: 5rem 0;
    width: 54rem;
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
  .mobile {
    display: none !important;
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
    .mobile {
      display: block !important;
    }
    .desktop {
      display: none !important;
    }
  }
</style>

<svelte:head>
  <title>{seed.host}</title>
</svelte:head>

{#await seed.getInfo()}
  <main class="off-centered">
    <Loading center />
  </main>
{:then info}
  <main>
    <header>
      <div class="info">
        <span class="title">
          <span class="bold">
            {seed.host}
          </span>
        </span>
      </div>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="label">Seed</div>
      {#if info.version === "0.2.0" && seed.host}
        {#await seed.getPeer() then peer}
          <div class="mobile">
            <button class="tiny faded" disabled={seedCopied} on:click={copySeed(peer.id, seed.host)}>
              {#if seedCopied}
                Copy ✓
              {:else}
                Copy
              {/if}
            </button>
          </div>
          <div class="seed-address desktop">
            <span class="seed-icon">🌱</span>
            {utils.formatSeedId(peer.id)}@{seed.host}
            <span class="faded">:{seed.config.seed.link.port}</span>
          </div>
          <div class="desktop">
            <button
              class="tiny faded"
              disabled={seedCopied}
              on:click={copySeed(peer.id, seed.host)}
            >
              {#if seedCopied}
                Copy ✓
              {:else}
                Copy
              {/if}
            </button>
          </div>
        {/await}
      {:else}
        <div class="seed-address subtle">N/A</div>
        <div class="desktop" />
      {/if}
      <!-- API Port -->
      <div class="label">API Port</div>
      <div>{seed.config.seed.api.port}</div>
      <div class="desktop" />
      <!-- API Version -->
      <div class="label">Version</div>
      <div>{info.version}</div>
      <div class="desktop" />
    </div>
    <!-- Seed Projects -->
    {#if info.version === "0.2.0"}
      {#await seed.getProjects() then projects}
        <div class="projects">
          {#each projects as project}
            <div class="project">
              <Widget {project} {config} seed={seed.host} />
            </div>
          {/each}
        </div>
      {/await}
    {:else}
      <div class="projects subtle">For seed project listing, update http-api to v0.2.0</div>
    {/if}
  </main>
{/await}
