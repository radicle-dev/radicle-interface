<script lang="ts">
  import type { Config } from "@app/config";
  import { formatSeedId } from "@app/utils";
  import { Seed } from "@app/base/seeds/Seed";
  import Loading from "@app/Loading.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Clipboard from "@app/Clipboard.svelte";
  import Projects from "@app/base/orgs/View/Projects.svelte";
  import type { Session } from "@app/session";
  import Address from "@app/Address.svelte";
  import SiweConnect from "@app/SiweConnect.svelte";
  import type { SeedSession } from "@app/siwe";

  export let config: Config;
  export let session: Session | null;
  export let host: string;

  let siweSession: SeedSession | null = null;

  $: if (session?.siwe) {
    const entries = Object.entries(session.siwe);
    const result = entries.find(([, session]) => session.domain === host);
    if (result) {
      siweSession = result[1];
    }
  }
</script>

<style>
  main {
    padding: 5rem 0;
    width: 720px;
  }
  main > header {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
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
  .session-info {
    display: flex;
    flex-direction: row;
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
      <span class="title">
        <span class="bold">
          {host} <span class="desktop inline">{seed.emoji}</span>
        </span>
      </span>
      <!-- User Session -->
      <div class="siwe">
        {#if session?.signer}
          {#if siweSession}
            <div class="session-info">
              <span style:margin-right="0.5rem">Signed in as&nbsp;</span><Address address={siweSession.address} {config} compact resolve />
            </div>
          {:else}
            <SiweConnect {seed} {config} />
          {/if}
        {:else}
          <SiweConnect disabled {seed} {config} tooltip={"Connect your wallet to sign in"} />
        {/if}
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
