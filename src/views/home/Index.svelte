<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";

  import * as router from "@app/lib/router";
  import { config } from "@app/lib/config";
  import { getProjectsFromSeeds } from "@app/lib/search";
  import { loadProjectActivity } from "@app/lib/commit";
  import { twemoji } from "@app/lib/utils";

  import Loading from "@app/components/Loading.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  function goToProject(project: Project, baseUrl: BaseUrl) {
    router.push({
      resource: "projects",
      params: {
        view: { resource: "tree" },
        id: project.id,
        hostnamePort: baseUrl.hostname,
        peer: undefined,
        revision: undefined,
      },
    });
  }
</script>

<style>
  main {
    padding: 3rem 3rem;
    width: 100%;
    max-width: 74rem;
  }
  .blurb {
    color: var(--color-foreground);
    padding: 0rem;
    max-width: 70%;
    font-size: var(--font-size-medium);
    text-align: left;
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
  }
  .projects {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
  }
  .project {
    width: 16rem;
  }
  .heading {
    color: var(--color-secondary);
    padding: 1rem 0rem;
    font-size: var(--font-size-medium);
    margin-bottom: 1rem;
  }
  .loading {
    padding-top: 2rem;
  }
  @media (max-width: 720px) {
    .blurb {
      max-width: none;
      font-size: var(--font-size-regular);
    }
    .heading {
      font-size: var(--font-size-regular);
    }
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main>
  <div class="blurb">
    <p use:twemoji>
      Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software
      over a peer-to-peer network 🌐 built on Git.
    </p>
  </div>

  {#await getProjectsFromSeeds(config.projects.pinned)}
    <div class="loading">
      <Loading center />
    </div>
  {:then results}
    {#if results.length}
      <div class="heading">
        Explore <span class="txt-bold">projects</span>
        on the Radicle network.
      </div>

      <div class="projects">
        {#each results as result}
          {#await loadProjectActivity(result.project.id, result.baseUrl) then activity}
            <div class="project">
              <ProjectCard
                compact
                description={result.project.description}
                head={result.project.head}
                id={result.project.id}
                name={result.project.name}
                {activity}
                on:click={() => goToProject(result.project, result.baseUrl)} />
            </div>
          {/await}
        {/each}
      </div>
    {/if}
  {:catch error}
    <div class="padding">
      <ErrorMessage message="Couldn't load projects." stackTrace={error} />
    </div>
  {/await}
</main>
