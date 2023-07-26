<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { ProjectActivity } from "@app/views/seeds/router";

  import { config } from "@app/lib/config";
  import { isLocal, truncateId } from "@app/lib/utils";
  import { loadProjects } from "@app/views/seeds/router";

  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  export let baseUrl: BaseUrl;
  export let nid: string;
  export let projectCount: number;
  export let projectPageIndex: number;
  export let projects: ProjectActivity[] = [];
  export let version: string;

  let error: any;
  let loadingProjects = false;

  async function loadMore(): Promise<void> {
    loadingProjects = true;
    try {
      const result = await loadProjects(projectPageIndex, baseUrl);
      projectCount = result.total;
      projects = [...projects, ...result.projects];
      projectPageIndex += 1;
    } catch (err) {
      error = err;
    } finally {
      loadingProjects = false;
    }
  }

  $: hostname = isLocal(baseUrl.hostname) ? "radicle.local" : baseUrl.hostname;
  $: showMoreButton =
    !loadingProjects &&
    !error &&
    projectCount &&
    projects.length < projectCount;
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

<div class="wrapper">
  <div class="header">
    {hostname}
  </div>

  <table>
    <tr>
      <td class="txt-highlight">Address</td>
      <td>
        <div class="seed-address">
          {truncateId(nid)}@{baseUrl.hostname}
          <Clipboard
            small
            text={`${nid}@${baseUrl.hostname}:${config.seeds.defaultNodePort}`} />
        </div>
      </td>
    </tr>
    <tr>
      <td class="txt-highlight">Version</td>
      <td>
        {version}
      </td>
    </tr>
  </table>

  <div style:margin-bottom="5rem">
    <div style:margin-top="1rem">
      {#each projects as { project, activity }}
        <div style:margin-bottom="0.5rem">
          <Link
            route={{
              resource: "project.tree",
              project: project.id,
              seed: baseUrl,
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
        <Button variant="foreground" on:click={loadMore}>More</Button>
      </div>
    {/if}
    {#if error}
      <ErrorMessage
        message="Not able to load more projects from this seed."
        stackTrace={error.stack} />
    {/if}
  </div>
</div>
