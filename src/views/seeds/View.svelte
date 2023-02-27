<script lang="ts">
  import type { Project, NodeStats } from "@httpd-client";

  import { config } from "@app/lib/config";
  import { HttpdClient } from "@httpd-client";
  import { extractBaseUrl, isLocal, truncateId } from "@app/lib/utils";

  import Clipboard from "@app/components/Clipboard.svelte";
  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Projects from "@app/views/seeds/View/Projects.svelte";

  export let hostnamePort: string;

  const baseUrl = extractBaseUrl(hostnamePort);
  const hostName = isLocal(baseUrl.hostname)
    ? "radicle.local"
    : baseUrl.hostname;
  const api = new HttpdClient(baseUrl);

  const getProjectsAndStats = async (): Promise<{
    stats: NodeStats;
    projects: Project[];
  }> => {
    const stats = await api.getStats();
    const projects = await api.project.getAll({ page: 0, perPage: 10 });
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
    grid-template-columns: 5rem 4fr 0fr;
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
  .seed-wrapper {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  .seed-address {
    display: inline-flex;
    font-size: var(--font-size-regular);
    line-height: 2rem;
    color: var(--color-foreground-6);
    vertical-align: middle;
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

{#await api.getRoot()}
  <main class="layout-centered">
    <Loading center />
  </main>
{:then nodeInfo}
  <main>
    <header>
      <span class="title txt-title">
        <span class="txt-bold">
          {hostName}
        </span>
      </span>
    </header>

    <div class="fields">
      <!-- Seed Address -->
      <div class="txt-highlight">Address</div>
      <div class="seed-wrapper">
        <div class="seed-address">
          {truncateId(nodeInfo.node.id)}@{baseUrl.hostname}
        </div>
        <Clipboard
          small
          text={`${nodeInfo.node.id}@${baseUrl.hostname}:${config.seeds.defaultNodePort}`} />
      </div>
      <div class="layout-desktop" />
      <!-- API Version -->
      <div class="txt-highlight">Version</div>
      <div>{nodeInfo.version}</div>
      <div class="layout-desktop" />
    </div>
    <!-- Seed Projects -->
    {#await getProjectsAndStats()}
      <Loading center />
    {:then result}
      <Projects {baseUrl} projects={result.projects} stats={result.stats} />
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
      title={baseUrl.hostname}
      subtitle="Not able to query information from this seed." />
  </div>
{/await}
