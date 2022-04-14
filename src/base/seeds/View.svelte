<script lang="ts">
  import type { Config } from "@app/config";
  import { formatSeedId } from "@app/utils";
  import { Seed } from "@app/base/seeds/Seed";
  import Loading from "@app/Loading.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Clipboard from "@app/Clipboard.svelte";
  import Projects from "@app/base/orgs/View/Projects.svelte";
  import { SeedSession, signInWithEthereum } from "@app/siwe";
  import { session } from "@app/session";
  import Address from "@app/Address.svelte";

  export let config: Config;
  export let host: string;

  let sessionData: SeedSession | null = null;

  $: if ($session) {
    const entries = Object.entries($session.siwe);
    const result = entries.find(([, session]) => session.domain === host);
    if (result) {
      sessionData = result[1];
    }
  }

  const signIn = async (seed: Seed) => {
    await signInWithEthereum(seed, config);
  };
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
  .inline {
    display: inline !important;
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
            {host} <span class="desktop inline">{seed.emoji}</span>
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
      <div>{formatSeedId(seed.id)} <Clipboard small text={seed.id} /></div>
      <div class="desktop" />
      <!-- API Port -->
      <div class="label">API Port</div>
      <div>{seed.api.port}</div>
      <div class="desktop" />
      <!-- API Version -->
      <div class="label">Version</div>
      <div>{seed.version}</div>
      <div class="desktop" />
      <!-- User Session -->
      <div class="label">Connection</div>
      {#if sessionData}
        <div class="desktop"><Address address={sessionData.address} resolve {config} /></div>
        <div class="mobile"><Address address={sessionData.address} compact resolve {config} /></div>
        <div class="desktop" />
      {:else}
        <div class="subtle">Not connected</div>
        {#if config.signer}
          <div class="desktop">
            <button class="tiny secondary" on:click={() => signIn(seed)}>
              Sign in with Ethereum
            </button>
          </div>
        {/if}
      {/if}
    </div>
    <!-- Seed Projects -->
    <Projects {seed} {config} />
  </main>
{:catch}
  <NotFound
    title={host}
    subtitle="Not able to query information from this seed."
  />
{/await}
