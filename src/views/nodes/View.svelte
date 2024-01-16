<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { ProjectActivity } from "@app/views/nodes/router";

  import { isLocal, truncateId } from "@app/lib/utils";
  import { loadProjects } from "@app/views/nodes/router";

  import AppLayout from "@app/App/AppLayout.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import Button from "@app/components/Button.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";

  export let baseUrl: BaseUrl;
  export let nid: string;
  export let externalAddresses: string[];
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

  $: hostname = isLocal(baseUrl.hostname) ? "Local Node" : baseUrl.hostname;
  $: showMoreButton =
    !loadingProjects &&
    !error &&
    projectCount &&
    projects.length < projectCount;
</script>

<style>
  .layout {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 3rem 0 5rem 0;
  }
  .wrapper {
    width: 720px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3.5rem;
  }
  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .title {
    display: flex;
    font-size: var(--font-size-x-large);
    font-weight: var(--font-weight-bold);
  }
  .info {
    display: flex;
    justify-content: space-between;
  }
  .version {
    color: var(--color-fill-gray);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
  }
  .projects {
    display: flex;
    gap: 2rem;
    flex-direction: column;
  }
  .more {
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 720px) {
    .projects {
      gap: 1.5rem;
    }
    .wrapper {
      width: 100%;
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      gap: 2rem;
    }
    .layout {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 0;
    }
    .info {
      flex-direction: column;
    }
  }
</style>

<AppLayout>
  <div class="layout">
    <div class="wrapper">
      <div class="header">
        <div class="title">
          {hostname}
        </div>
        <div class="info">
          <div>
            {#each externalAddresses as address}
              <!-- If there are externalAddresses this is probably a remote node -->
              <!-- in that case, we show all the defined externalAddresses as a listing -->
              <CopyableId id={`${nid}@${address}`}>
                {truncateId(nid)}@{address}
              </CopyableId>
            {:else}
              <!-- else this is probably a local node -->
              <!-- So we show only the nid -->
              <CopyableId id={nid} />
            {/each}
          </div>
          <div class="version">
            v{version}
          </div>
        </div>
      </div>

      <div class="projects">
        {#each projects as { project, activity } (project.id)}
          <Link
            route={{
              resource: "project.source",
              project: project.id,
              node: baseUrl,
            }}>
            <div class="global-hide-on-mobile">
              <ProjectCard
                {activity}
                id={project.id}
                name={project.name}
                visibility={project.visibility?.type}
                description={project.description}
                head={project.head} />
            </div>
            <div class="global-hide-on-desktop">
              <ProjectCard
                compact
                {activity}
                id={project.id}
                name={project.name}
                visibility={project.visibility?.type}
                description={project.description}
                head={project.head} />
            </div>
          </Link>
        {/each}
      </div>

      {#if loadingProjects}
        <div class="more">
          <Loading noDelay small />
        </div>
      {/if}

      {#if showMoreButton}
        <div class="more">
          <Button size="large" variant="outline" on:click={loadMore}>
            More
          </Button>
        </div>
      {/if}

      {#if error}
        <ErrorMessage
          message="Not able to load more projects from this node"
          {error} />
      {/if}
    </div>
  </div>
</AppLayout>
