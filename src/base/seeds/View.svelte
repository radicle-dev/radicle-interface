<script lang="ts">
  import type { Config } from "@app/config";
  import { formatSeedId, formatSeedHost } from "@app/utils";
  import { Seed } from "@app/base/seeds/Seed";
  import Loading from "@app/Loading.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import NotFound from "@app/NotFound.svelte";
  import Clipboard from "@app/Clipboard.svelte";
  import Projects from "@app/base/seeds/View/Projects.svelte";
  import type { Session } from "@app/session";
  import Address from "@app/Address.svelte";
  import SiweConnect from "@app/SiweConnect.svelte";
  import type { SeedSession } from "@app/siwe";
  import Async from "@app/Async.svelte";
  import { Project } from "@app/project";
  import type { Host } from "@app/api";

  export let config: Config;
  export let session: Session | null;
  export let host: string;

  const hostName = formatSeedHost(host);
  const seedHost: Host = { host, port: null };
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
  .signed-in {
    color: var(--color-foreground-5);
    margin-right: 0.5rem;
  }
  .session-info {
    display: flex;
    flex-direction: row;
    background: var(--color-secondary-2);
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
  }
  .desktop {
    display: block !important;
  }
  .inline {
    display: inline !important;
  }
  .seed-label {
    display: flex;
    align-items: center;
  }

  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .signed-in {
      display: none;
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
  <title>{hostName}</title>
</svelte:head>

{#await Seed.lookup(host, config)}
  <main class="off-centered">
    <Loading center />
  </main>
{:then seed}
  <main>
    <header>
      <span class="title txt-title">
        <span class="txt-bold">
          {hostName}
          <span class="desktop inline">{seed.emoji}</span>
        </span>
      </span>
      <!-- User Session -->
      <div class="siwe">
        {#if session?.signer}
          {#if siweSession}
            <div class="session-info">
              <span class="signed-in txt-small">Signed in as</span>
              <Address
                address={siweSession.address}
                {config}
                small
                compact
                resolve />
            </div>
          {:else}
            <SiweConnect {seed} address={session.address} {config} />
          {/if}
        {:else}
          <SiweConnect
            disabled
            {seed}
            {config}
            tooltip={"Connect your wallet to sign in"} />
        {/if}
      </div>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="label">Address</div>
      <SeedAddress {seed} port={seed.link.port} />
      <!-- Seed ID -->
      <div class="label">Seed ID</div>
      <div class="seed-label">
        {formatSeedId(seed.id)}
        <Clipboard small text={seed.id} />
      </div>
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
    <Async fetch={Project.getProjects(seedHost, { perPage: 10 })} let:result>
      <Projects {seed} projects={result} />
    </Async>
  </main>
{:catch}
  <NotFound
    title={host}
    subtitle="Not able to query information from this seed." />
{/await}
