<script lang="ts">
  import type { Host } from "@app/lib/api";
  import type { ProjectInfo } from "@app/lib/project";
  import type { Stats } from "@app/lib/seed";

  import Clipboard from "@app/components/Clipboard.svelte";
  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Projects from "@app/views/seeds/View/Projects.svelte";
  import SeedAddress from "@app/views/seeds/View/SeedAddress.svelte";
  import { Project } from "@app/lib/project";
  import { Seed, defaultSeedPort } from "@app/lib/seed";
  import { formatSeedId, formatSeedHost, twemoji } from "@app/lib/utils";

  export let hostAndPort: string;

  const [host, port] = hostAndPort.includes(":")
    ? hostAndPort.split(":")
    : [hostAndPort, defaultSeedPort];

  const hostName = formatSeedHost(host);
  const seedHost: Host = { host, port: Number(port) };

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
  .seed-label {
    display: flex;
    align-items: center;
  }

  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
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
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="txt-highlight">Address</div>
      <SeedAddress {seed} port={seed.node.port} />
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
    {#await getProjectsAndStats(seed)}
      <Loading center />
    {:then result}
      <Projects {seed} projects={result.projects} stats={result.stats} />
    {:catch err}
      <div class="error txt-tiny">
        <div>
          API request to <span class="txt-monospace">{err.url}</span>
          failed.
        </div>
      </div>
    {/await}
  </main>
{:catch}
  <div class="layout-centered">
    <NotFound
      title={host}
      subtitle="Not able to query information from this seed." />
  </div>
{/await}
