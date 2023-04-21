<script lang="ts">
  import type { Project, NodeStats } from "@httpd-client";
  import type { WeeklyActivity } from "@app/lib/commit";

  import { HttpdClient } from "@httpd-client";
  import { config } from "@app/lib/config";
  import { extractBaseUrl, isLocal, truncateId } from "@app/lib/utils";
  import { loadProjectActivity } from "@app/lib/commit";

  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  export let hostnamePort: string;

  const baseUrl = extractBaseUrl(hostnamePort);
  const hostName = isLocal(baseUrl.hostname)
    ? "radicle.local"
    : baseUrl.hostname;
  const api = new HttpdClient(baseUrl);

  const perPage = 10;
  let page = 0;
  let error: any;
  let loadingProjects = false;

  let projects: Project[] = [];
  let nodeStats: NodeStats | undefined = undefined;
  let projectsWithActivity: { project: Project; activity: WeeklyActivity[] }[] =
    [];

  async function loadProjects(): Promise<void> {
    loadingProjects = true;
    try {
      [nodeStats, projects] = await Promise.all([
        api.getStats(),
        api.project.getAll({ page, perPage }),
      ]);

      const results = await Promise.all(
        projects.map(async project => {
          const activity = await loadProjectActivity(project.id, baseUrl);
          return {
            project,
            activity,
          };
        }),
      );
      projectsWithActivity = [...projectsWithActivity, ...results];
      page += 1;
    } catch (e) {
      error = e;
    } finally {
      loadingProjects = false;
    }
  }

  $: showMoreButton =
    !loadingProjects &&
    !error &&
    nodeStats &&
    projectsWithActivity.length < nodeStats.projects.count;

  loadProjects();
</script>

<style>
  .wrapper {
    width: 720px;
    margin: 5rem 0;
  }
  .header {
    align-items: center;
    color: var(--color-secondary);
    display: flex;
    flex-direction: row;
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-bold);
    justify-content: space-between;
    margin-bottom: 2rem;
    overflow-x: hidden;
    text-align: left;
    text-overflow: ellipsis;
    width: 100%;
  }
  table {
    border-collapse: collapse;
  }
  td {
    padding-bottom: 1.5rem;
    padding-right: 3rem;
  }
  .seed-address {
    display: flex;
    align-items: center;
    color: var(--color-foreground-6);
    white-space: nowrap;
  }
  .more {
    margin-top: 2rem;
    text-align: center;
  }
  @media (max-width: 720px) {
    .wrapper {
      width: 100%;
      padding: 1.5rem;
    }
  }
</style>

<svelte:head>
  <title>{hostName}</title>
</svelte:head>

<div class="wrapper">
  <div class="header">
    {hostName}
  </div>

  {#await api.getRoot()}
    <Loading center />
  {:then nodeInfo}
    <table>
      <tr>
        <td class="txt-highlight">Address</td>
        <td>
          <div class="seed-address">
            {truncateId(nodeInfo.node.id)}@{baseUrl.hostname}
            <Clipboard
              small
              text={`${nodeInfo.node.id}@${baseUrl.hostname}:${config.seeds.defaultNodePort}`} />
          </div>
        </td>
      </tr>
      <tr>
        <td class="txt-highlight">Version</td>
        <td>
          {nodeInfo.version}
        </td>
      </tr>
    </table>
  {:catch error}
    <div style:margin-bottom="2rem">
      <ErrorMessage
        message="Not able to query information from this seed."
        stackTrace={error.stack} />
    </div>
  {/await}

  <div style:margin-bottom="5rem">
    {#if projects}
      <div style:margin-top="1rem">
        {#each projectsWithActivity as { project, activity }}
          <div style:margin-bottom="0.5rem">
            <Link
              route={{
                resource: "projects",
                params: {
                  view: { resource: "tree" },
                  id: project.id,
                  hostnamePort:
                    baseUrl.port === config.seeds.defaultHttpdPort
                      ? baseUrl.hostname
                      : `${baseUrl.hostname}:${baseUrl.port}`,
                  revision: undefined,
                  hash: undefined,
                  search: undefined,
                },
              }}>
              <ProjectCard
                {activity}
                id={project.id}
                name={project.name}
                description={project.description}
                head={project.head} />
            </Link>
          </div>
        {/each}
      </div>
      {#if loadingProjects}
        <div class="more">
          <Loading small />
        </div>
      {/if}
      {#if showMoreButton}
        <div class="more">
          <Button variant="foreground" on:click={loadProjects}>More</Button>
        </div>
      {/if}
    {/if}
    {#if error}
      <ErrorMessage
        message="Not able to load projects from this seed."
        stackTrace={error.stack} />
    {/if}
  </div>
</div>
