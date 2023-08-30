<script lang="ts">
  import type { ProjectBaseUrlActivity } from "./router";

  import { twemoji } from "@app/lib/utils";

  import Link from "@app/components/Link.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  export let projects: ProjectBaseUrlActivity[];
</script>

<style>
  .wrapper {
    padding: 3rem 15rem;
    width: 100%;
  }
  .blurb {
    color: var(--color-foreground-contrast);
    padding: 0rem;
    max-width: 65%;
    font-size: var(--font-size-medium);
    text-align: left;
    margin-bottom: 1.5rem;
  }
  .projects {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 3rem;
    width: 100%;
  }
  .project {
    width: 16rem;
  }
  .heading {
    color: var(--color-foreground-emphasized);
    padding: 1rem 0rem;
    font-size: var(--font-size-medium);
    margin-bottom: 1rem;
  }
  @media (max-width: 1200px) {
    .wrapper {
      padding: 3rem 4rem;
    }
    .projects {
      gap: 2rem;
    }
  }
  @media (max-width: 720px) {
    .wrapper {
      padding: 3rem 2rem;
    }
    .projects {
      gap: 1rem;
    }
    .blurb {
      max-width: none;
      font-size: var(--font-size-regular);
    }
    .heading {
      font-size: var(--font-size-regular);
    }
  }
</style>

<div class="wrapper">
  <div class="blurb">
    <p use:twemoji>
      Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software
      over a peer-to-peer network 🌐 built on Git.
    </p>
  </div>

  {#if projects.length > 0}
    <div class="heading">
      Explore <span class="txt-bold">projects</span>
      on the Radicle network.
    </div>

    <div class="projects">
      {#each projects as { project, baseUrl, activity }}
        <div class="project">
          <Link
            route={{
              resource: "project.source",
              project: project.id,
              node: baseUrl,
            }}>
            <ProjectCard
              compact
              description={project.description}
              head={project.head}
              id={project.id}
              name={project.name}
              {activity} />
          </Link>
        </div>
      {/each}
    </div>
  {/if}
</div>
