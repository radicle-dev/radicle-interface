<script lang="ts">
  import type { Wallet } from "@app/wallet";
  import type { Stats } from "@app/base/seeds/Seed";
  import type { ProjectInfo } from "@app/project";
  import { formatSeedId, formatSeedHost, twemoji } from "@app/utils";
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

  export let wallet: Wallet;
  export let session: Session | null;
  export let hostAndPort: string;

  const [host, port] = hostAndPort.includes(":")
    ? hostAndPort.split(":")
    : [hostAndPort, 8777];

  const hostName = formatSeedHost(host);
  const seedHost: Host = { host, port: Number(port) };
  let siweSession: SeedSession | null = null;

  const getProjectsAndStats = async (
    seed: Seed,
  ): Promise<{
    stats: Stats;
    projects: ProjectInfo[];
  }> => {
    const stats = await seed.getStats();
    const projects = await Project.getProjects(seedHost, { perPage: 10 });
    return { stats, projects };
  };

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
    gap: 1rem 2rem;
    margin-bottom: 2rem;
  }
  .fields > div {
    place-self: center start;
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
  }
</style>

<svelte:head>
  <title>{hostName}</title>
</svelte:head>

{#await Seed.lookup(host, Number(port))}
  <main class="layout-centered">
    <Loading center />
  </main>
{:then seed}
  <main>
    <header>
      <span class="title txt-title">
        <span class="txt-bold">
          {hostName}
          <span class="layout-desktop-inline" use:twemoji>{seed.emoji}</span>
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
                {wallet}
                small
                compact
                resolve />
            </div>
          {:else}
            <SiweConnect {seed} address={session.address} {wallet} />
          {/if}
        {:else}
          <SiweConnect
            disabled
            {seed}
            {wallet}
            tooltip={"Connect your wallet to sign in"} />
        {/if}
      </div>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="txt-highlight">Address</div>
      <SeedAddress {seed} port={seed.link.port} />
      <!-- Seed ID -->
      <div class="txt-highlight">Seed ID</div>
      <div class="seed-label">
        {formatSeedId(seed.id)}
        <Clipboard small text={seed.id} />
      </div>
      <div class="layout-desktop" />
      <!-- API Port -->
      <div class="txt-highlight">API Port</div>
      <div>{port}</div>
      <div class="layout-desktop" />
      <!-- API Version -->
      <div class="txt-highlight">Version</div>
      <div>{seed.version}</div>
      <div class="layout-desktop" />
    </div>
    <!-- Seed Projects -->
    <Async fetch={getProjectsAndStats(seed)} let:result>
      <Projects {seed} projects={result.projects} stats={result.stats} />
    </Async>
  </main>
{:catch}
  <NotFound
    title={host}
    subtitle="Not able to query information from this seed." />
{/await}
