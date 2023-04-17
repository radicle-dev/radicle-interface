<script lang="ts">
  import type { BaseUrl, Project, NodeStats } from "@httpd-client";

  import * as router from "@app/lib/router";
  import { HttpdClient } from "@httpd-client";
  import { config } from "@app/lib/config";
  import { loadProjectActivity } from "@app/lib/commit";

  import List from "@app/components/List.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  export let baseUrl: BaseUrl;
  export let projects: Project[];
  export let stats: NodeStats;

  const api = new HttpdClient(baseUrl);
  // A pointer to the current page of projects added to the listing
  let page = 0;

  const fetchMoreProjects = async (): Promise<Project[]> => {
    try {
      stats = await api.getStats();
      const projects = await api.project.getAll({
        page: (page += 1),
        perPage: 10,
      });

      if (projects.length > 0) {
        return projects;
      }
    } catch (e) {
      console.error(e);
    }

    // We return an empty array, for when no more projects are found, or an error is thrown
    // since List is looking for an iterable.
    return [];
  };

  const onClick = (project: Project) => {
    router.push({
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
    });
  };
</script>

<style>
  .projects {
    margin-top: 1rem;
  }
  .projects .project {
    margin-bottom: 0.5rem;
  }
</style>

<div class="projects">
  <List
    bind:items={projects}
    complete={projects.length === stats.projects.count}
    query={fetchMoreProjects}>
    <svelte:fragment slot="list" let:items>
      {#each items as project}
        {#await loadProjectActivity(project.id, baseUrl) then activity}
          <div class="project">
            <ProjectCard
              {activity}
              id={project.id}
              name={project.name}
              description={project.description}
              head={project.head}
              on:click={() => onClick(project)} />
          </div>
        {/await}
      {/each}
    </svelte:fragment>
  </List>
</div>
